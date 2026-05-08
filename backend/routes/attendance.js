const router = require('express').Router()
const Attendance = require('../models/Attendance')
const Course = require('../models/Course')
const { protect, authorize } = require('../middleware/auth')

// GET /api/attendance/my — student's own attendance
router.get('/my', protect, authorize('student'), async (req, res) => {
  try {
    const records = await Attendance.find({ student: req.user._id })
      .populate('course', 'name')
      .populate('markedBy', 'name')
      .sort({ date: -1 })

    const present = records.filter((r) => r.status === 'present').length
    const absent = records.filter((r) => r.status === 'absent').length
    const late = records.filter((r) => r.status === 'late').length
    const total = records.length
    const rate = total > 0 ? Math.round(((present + late * 0.5) / total) * 100) : 0

    res.json({ records, summary: { present, absent, late, total, rate } })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/attendance/sheet — teacher loads students for a course+date
router.get('/sheet', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { course, date } = req.query
    if (!course || !date) return res.status(400).json({ message: 'course and date required' })

    const courseDoc = await Course.findById(course).populate('students', 'name email')
    if (!courseDoc) return res.status(404).json({ message: 'Course not found' })

    // Load existing attendance for that date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const existing = await Attendance.find({
      course,
      date: { $gte: startOfDay, $lte: endOfDay },
    })

    const existingMap = {}
    existing.forEach((a) => { existingMap[a.student.toString()] = a.status })

    res.json({ students: courseDoc.students, existing: existingMap })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/attendance/mark — teacher marks attendance
router.post('/mark', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { course, date, records } = req.body
    if (!course || !date || !records?.length) {
      return res.status(400).json({ message: 'course, date and records required' })
    }

    const dateObj = new Date(date)
    dateObj.setHours(12, 0, 0, 0) // normalize to noon

    const ops = records.map(({ student, status }) => ({
      updateOne: {
        filter: {
          student,
          course,
          date: {
            $gte: new Date(dateObj.setHours(0, 0, 0, 0)),
            $lte: new Date(dateObj.setHours(23, 59, 59, 999)),
          },
        },
        update: { $set: { student, course, date: new Date(date), status, markedBy: req.user._id } },
        upsert: true,
      },
    }))

    await Attendance.bulkWrite(ops)
    res.json({ message: 'Attendance saved' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/attendance/history — teacher views history for a course
router.get('/history', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { course } = req.query
    if (!course) return res.status(400).json({ message: 'course required' })

    const records = await Attendance.find({ course }).sort({ date: -1 })

    // Group by date
    const grouped = {}
    records.forEach((r) => {
      const key = r.date.toISOString().split('T')[0]
      if (!grouped[key]) grouped[key] = { date: r.date, present: 0, absent: 0, late: 0 }
      grouped[key][r.status]++
    })

    const history = Object.values(grouped).map((g) => {
      const total = g.present + g.absent + g.late
      return { ...g, rate: total > 0 ? Math.round(((g.present + g.late * 0.5) / total) * 100) : 0 }
    })

    res.json(history)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
