const router = require('express').Router()
const Attendance = require('../models/Attendance')
const ExamResult = require('../models/ExamResult')
const Exam = require('../models/Exam')
const Course = require('../models/Course')
const { protect, authorize } = require('../middleware/auth')

// GET /api/students/dashboard
router.get('/dashboard', protect, authorize('student'), async (req, res) => {
  try {
    const studentId = req.user._id

    // Attendance stats
    const attendanceRecords = await Attendance.find({ student: studentId })
    const present = attendanceRecords.filter((r) => r.status === 'present').length
    const total = attendanceRecords.length
    const attendanceRate = total > 0 ? Math.round((present / total) * 100) : 0

    // Exam results
    const results = await ExamResult.find({ student: studentId })
    const examsTaken = results.length
    const avgScore = examsTaken > 0
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / examsTaken)
      : 0

    // Upcoming exams
    const courses = await Course.find({ students: studentId })
    const courseIds = courses.map((c) => c._id)
    const now = new Date()
    const upcomingExamsList = await Exam.find({
      course: { $in: courseIds },
      published: true,
      scheduledAt: { $gte: now },
    }).populate('course', 'name').sort({ scheduledAt: 1 }).limit(5)

    // Recent results
    const recentResults = await ExamResult.find({ student: studentId })
      .populate({ path: 'exam', select: 'title', populate: { path: 'course', select: 'name' } })
      .sort({ submittedAt: -1 })
      .limit(5)

    res.json({
      stats: {
        attendanceRate,
        examsTaken,
        avgScore,
        upcomingExams: upcomingExamsList.length,
      },
      upcomingExams: upcomingExamsList,
      recentResults,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
