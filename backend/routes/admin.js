const router = require('express').Router()
const User = require('../models/User')
const Course = require('../models/Course')
const Exam = require('../models/Exam')
const ExamResult = require('../models/ExamResult')
const Attendance = require('../models/Attendance')
const { protect, authorize } = require('../middleware/auth')

// GET /api/admin/stats
router.get('/stats', protect, authorize('admin'), async (req, res) => {
  try {
    const totalStudents = await User.countDocuments({ role: 'student' })
    const totalTeachers = await User.countDocuments({ role: 'teacher' })
    const totalCourses = await Course.countDocuments()
    const totalExams = await Exam.countDocuments()

    const now = new Date()
    const activeExams = await Exam.countDocuments({
      published: true,
      scheduledAt: { $lte: now },
      endsAt: { $gte: now },
    })

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const submissionsToday = await ExamResult.countDocuments({
      submittedAt: { $gte: today, $lt: tomorrow },
    })

    const allAttendance = await Attendance.find()
    const present = allAttendance.filter((a) => a.status === 'present').length
    const avgAttendance = allAttendance.length > 0
      ? Math.round((present / allAttendance.length) * 100)
      : 0

    res.json({
      totalStudents,
      totalTeachers,
      totalCourses,
      totalExams,
      activeExams,
      submissionsToday,
      avgAttendance,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/admin/users
router.get('/users', protect, authorize('admin'), async (req, res) => {
  try {
    const { role } = req.query
    const filter = role ? { role } : {}
    const users = await User.find(filter).sort({ createdAt: -1 })
    res.json(users)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// PATCH /api/admin/users/:id
router.patch('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/admin/users/:id
router.delete('/users/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: 'User deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
