const router = require('express').Router()
const Attendance = require('../models/Attendance')
const ExamResult = require('../models/ExamResult')
const Exam = require('../models/Exam')
const Course = require('../models/Course')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

// GET /api/teachers/dashboard
router.get('/dashboard', protect, authorize('teacher'), async (req, res) => {
  try {
    const teacherId = req.user._id

    // Courses taught
    const courses = await Course.find({ teacher: teacherId })
    const courseIds = courses.map((c) => c._id)

    // Total students across all courses
    const allStudentIds = new Set()
    courses.forEach((c) => c.students.forEach((s) => allStudentIds.add(s.toString())))
    const totalStudents = allStudentIds.size

    // Exams
    const exams = await Exam.find({ createdBy: teacherId })
    const totalExams = exams.length

    // Average class score
    const results = await ExamResult.find({ exam: { $in: exams.map((e) => e._id) } })
    const avgClassScore = results.length
      ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
      : 0

    // Today's attendance rate
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayAttendance = await Attendance.find({
      course: { $in: courseIds },
      date: { $gte: today, $lt: tomorrow },
    })
    const presentToday = todayAttendance.filter((a) => a.status === 'present').length
    const todayRate = todayAttendance.length > 0
      ? Math.round((presentToday / todayAttendance.length) * 100)
      : 0

    // Recent exams with stats
    const recentExams = await Promise.all(
      exams.slice(0, 5).map(async (exam) => {
        const examResults = await ExamResult.find({ exam: exam._id })
        const avg = examResults.length
          ? Math.round(examResults.reduce((s, r) => s + r.score, 0) / examResults.length)
          : null
        return { ...exam.toJSON(), submissionCount: examResults.length, avgScore: avg }
      })
    )

    res.json({
      stats: { totalStudents, totalExams, avgClassScore, todayAttendance: todayRate },
      recentExams,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
