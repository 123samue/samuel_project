const router = require('express').Router()
const Course = require('../models/Course')
const User = require('../models/User')
const { protect, authorize } = require('../middleware/auth')

// GET /api/courses — all courses (admin) or enrolled (student)
router.get('/', protect, async (req, res) => {
  try {
    let courses
    if (req.user.role === 'admin') {
      courses = await Course.find().populate('teacher', 'name email')
    } else if (req.user.role === 'student') {
      courses = await Course.find({ students: req.user._id }).populate('teacher', 'name')
    } else {
      courses = await Course.find({ teacher: req.user._id }).populate('teacher', 'name')
    }
    res.json(courses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/courses/my — teacher's courses
router.get('/my', protect, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const courses = await Course.find({ teacher: req.user._id })
    res.json(courses)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/courses — admin creates course
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, teacher } = req.body
    if (!name) return res.status(400).json({ message: 'Course name required' })
    const course = await Course.create({ name, description, teacher: teacher || null })
    res.status(201).json(course)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/courses/:id/enroll — student enrolls
router.post('/:id/enroll', protect, authorize('student'), async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
    if (!course) return res.status(404).json({ message: 'Course not found' })
    if (course.students.includes(req.user._id)) {
      return res.status(400).json({ message: 'Already enrolled' })
    }
    course.students.push(req.user._id)
    await course.save()
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { enrolledCourses: course._id } })
    res.json({ message: 'Enrolled successfully' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// DELETE /api/courses/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id)
    res.json({ message: 'Course deleted' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
