const router = require('express').Router()
const Exam = require('../models/Exam')
const ExamResult = require('../models/ExamResult')
const Course = require('../models/Course')
const { protect, authorize } = require('../middleware/auth')

// GET /api/exams/my — teacher's exams
router.get('/my', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const exams = await Exam.find({ createdBy: req.user._id })
      .populate('course', 'name')
      .sort({ createdAt: -1 })

    // Attach submission counts
    const withStats = await Promise.all(
      exams.map(async (exam) => {
        const results = await ExamResult.find({ exam: exam._id })
        const avgScore = results.length
          ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
          : null
        return { ...exam.toJSON(), submissionCount: results.length, avgScore }
      })
    )
    res.json(withStats)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/exams/available — student sees available exams
router.get('/available', protect, authorize('student'), async (req, res) => {
  try {
    // Find courses the student is enrolled in
    const courses = await Course.find({ students: req.user._id })
    const courseIds = courses.map((c) => c._id)

    const exams = await Exam.find({
      course: { $in: courseIds },
      published: true,
    }).populate('course', 'name').sort({ scheduledAt: 1 })

    // Check which ones the student already submitted
    const results = await ExamResult.find({ student: req.user._id })
    const submittedIds = new Set(results.map((r) => r.exam.toString()))

    const enriched = exams.map((e) => ({
      ...e.toJSON(),
      questions: undefined, // don't expose questions/answers in list
      submitted: submittedIds.has(e._id.toString()),
    }))

    res.json(enriched)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/exams/my-results — student's results
router.get('/my-results', protect, authorize('student'), async (req, res) => {
  try {
    const results = await ExamResult.find({ student: req.user._id })
      .populate({ path: 'exam', populate: { path: 'course', select: 'name' } })
      .sort({ submittedAt: -1 })
    res.json(results)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/exams/:id — get exam details (teacher/admin)
router.get('/:id', protect, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('course', 'name')
    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    res.json(exam)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/exams/:id/take — student gets exam to take (no correct answers)
router.get('/:id/take', protect, authorize('student'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id).populate('course', 'name')
    if (!exam || !exam.published) return res.status(404).json({ message: 'Exam not available' })

    const now = new Date()
    if (now < exam.scheduledAt) return res.status(400).json({ message: 'Exam has not started yet' })
    if (now > exam.endsAt) return res.status(400).json({ message: 'Exam has ended' })

    // Check already submitted
    const existing = await ExamResult.findOne({ exam: exam._id, student: req.user._id })
    if (existing) return res.status(400).json({ message: 'You have already submitted this exam' })

    // Strip correct answers
    const safeExam = {
      ...exam.toJSON(),
      questions: exam.questions.map((q) => ({
        _id: q._id,
        text: q.text,
        options: q.options,
        // correctAnswer intentionally omitted
      })),
    }
    res.json(safeExam)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/exams/:id/submit — student submits exam
router.post('/:id/submit', protect, authorize('student'), async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam || !exam.published) return res.status(404).json({ message: 'Exam not found' })

    const now = new Date()
    if (now > new Date(exam.endsAt.getTime() + 5 * 60 * 1000)) {
      return res.status(400).json({ message: 'Submission window has closed' })
    }

    const existing = await ExamResult.findOne({ exam: exam._id, student: req.user._id })
    if (existing) return res.status(400).json({ message: 'Already submitted' })

    const { answers } = req.body // { questionId: selectedOptionIndex }
    let correct = 0
    const reviewData = []

    exam.questions.forEach((q) => {
      const selected = answers?.[q._id.toString()]
      const isCorrect = selected !== undefined && Number(selected) === q.correctAnswer
      if (isCorrect) correct++
      reviewData.push({
        questionText: q.text,
        yourAnswer: selected !== undefined ? q.options[Number(selected)] : null,
        correctAnswer: q.options[q.correctAnswer],
        correct: isCorrect,
      })
    })

    const score = Math.round((correct / exam.questions.length) * 100)

    const result = await ExamResult.create({
      exam: exam._id,
      student: req.user._id,
      answers,
      score,
      correctAnswers: correct,
      totalQuestions: exam.questions.length,
      reviewData,
    })

    res.json({ score, correctAnswers: correct, totalQuestions: exam.questions.length })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/exams/:id/results — teacher views all results for an exam
router.get('/:id/results', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const results = await ExamResult.find({ exam: req.params.id })
      .populate('student', 'name email')
      .sort({ score: -1 })
    res.json(results)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/exams — teacher creates exam
router.post('/', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { title, course, duration, scheduledAt, endsAt, instructions, published, questions } = req.body
    if (!title || !course || !duration || !scheduledAt || !endsAt) {
      return res.status(400).json({ message: 'Missing required fields' })
    }
    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: 'At least one question required' })
    }
    const exam = await Exam.create({
      title, course, duration, scheduledAt, endsAt, instructions,
      published: published || false,
      questions,
      createdBy: req.user._id,
    })
    res.status(201).json(exam)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/exams/:id — update exam
router.patch('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const exam = await Exam.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!exam) return res.status(404).json({ message: 'Exam not found' })
    res.json(exam)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/exams/:id
router.delete('/:id', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    await Exam.findByIdAndDelete(req.params.id)
    await ExamResult.deleteMany({ exam: req.params.id })
    res.json({ message: 'Exam deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
