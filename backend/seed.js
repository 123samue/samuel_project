require('dotenv').config()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const User = require('./models/User')
const Course = require('./models/Course')
const Exam = require('./models/Exam')
const Attendance = require('./models/Attendance')

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log('Connected to MongoDB')

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Course.deleteMany({}),
    Exam.deleteMany({}),
    Attendance.deleteMany({}),
  ])
  console.log('Cleared existing data')

  // Create users
  const adminUser = await User.create({
    name: 'Admin User',
    email: 'admin@school.edu',
    password: 'admin123',
    role: 'admin',
  })

  const teacher1 = await User.create({
    name: 'Dr. Sarah Johnson',
    email: 'sarah@school.edu',
    password: 'teacher123',
    role: 'teacher',
  })

  const teacher2 = await User.create({
    name: 'Prof. Mark Williams',
    email: 'mark@school.edu',
    password: 'teacher123',
    role: 'teacher',
  })

  const students = await User.insertMany([
    { name: 'Alice Brown', email: 'alice@school.edu', password: await bcrypt.hash('student123', 12), role: 'student' },
    { name: 'Bob Smith', email: 'bob@school.edu', password: await bcrypt.hash('student123', 12), role: 'student' },
    { name: 'Carol Davis', email: 'carol@school.edu', password: await bcrypt.hash('student123', 12), role: 'student' },
    { name: 'David Lee', email: 'david@school.edu', password: await bcrypt.hash('student123', 12), role: 'student' },
    { name: 'Emma Wilson', email: 'emma@school.edu', password: await bcrypt.hash('student123', 12), role: 'student' },
  ])

  console.log('Created users')

  // Create courses
  const mathCourse = await Course.create({
    name: 'Mathematics 101',
    description: 'Introduction to calculus and algebra',
    teacher: teacher1._id,
    students: students.map((s) => s._id),
  })

  const scienceCourse = await Course.create({
    name: 'Physics 201',
    description: 'Classical mechanics and thermodynamics',
    teacher: teacher2._id,
    students: students.slice(0, 3).map((s) => s._id),
  })

  // Update student enrollments
  await User.updateMany(
    { _id: { $in: students.map((s) => s._id) } },
    { $addToSet: { enrolledCourses: mathCourse._id } }
  )

  console.log('Created courses')

  // Create exams
  const now = new Date()
  const mathExam = await Exam.create({
    title: 'Midterm Exam - Calculus',
    course: mathCourse._id,
    createdBy: teacher1._id,
    duration: 60,
    scheduledAt: new Date(now.getTime() - 60 * 60 * 1000), // started 1 hour ago
    endsAt: new Date(now.getTime() + 2 * 60 * 60 * 1000),  // ends in 2 hours
    instructions: 'Answer all questions. No calculators allowed.',
    published: true,
    questions: [
      {
        text: 'What is the derivative of x²?',
        options: ['x', '2x', 'x²', '2x²'],
        correctAnswer: 1,
      },
      {
        text: 'What is the integral of 2x dx?',
        options: ['x', 'x² + C', '2x² + C', '2 + C'],
        correctAnswer: 1,
      },
      {
        text: 'What is the limit of (sin x)/x as x → 0?',
        options: ['0', 'undefined', '1', '∞'],
        correctAnswer: 2,
      },
      {
        text: 'Which of the following is a prime number?',
        options: ['15', '21', '17', '9'],
        correctAnswer: 2,
      },
      {
        text: 'What is 7 × 8?',
        options: ['54', '56', '58', '64'],
        correctAnswer: 1,
      },
    ],
  })

  const upcomingExam = await Exam.create({
    title: 'Final Exam - Algebra',
    course: mathCourse._id,
    createdBy: teacher1._id,
    duration: 90,
    scheduledAt: new Date(now.getTime() + 24 * 60 * 60 * 1000), // tomorrow
    endsAt: new Date(now.getTime() + 26 * 60 * 60 * 1000),
    instructions: 'Covers chapters 1-8.',
    published: true,
    questions: [
      {
        text: 'Solve: 2x + 4 = 10. What is x?',
        options: ['2', '3', '4', '5'],
        correctAnswer: 1,
      },
      {
        text: 'What is the quadratic formula?',
        options: [
          'x = (-b ± √(b²-4ac)) / 2a',
          'x = (b ± √(b²+4ac)) / 2a',
          'x = (-b ± √(b²-4ac)) / a',
          'x = (-b ± √(b+4ac)) / 2a',
        ],
        correctAnswer: 0,
      },
    ],
  })

  console.log('Created exams')

  // Create attendance records for the past 7 days
  const statuses = ['present', 'present', 'present', 'present', 'absent', 'late', 'present']
  for (let d = 6; d >= 0; d--) {
    const date = new Date()
    date.setDate(date.getDate() - d)
    date.setHours(9, 0, 0, 0)

    for (const student of students) {
      const status = statuses[Math.floor(Math.random() * statuses.length)]
      try {
        await Attendance.create({
          student: student._id,
          course: mathCourse._id,
          date,
          status,
          markedBy: teacher1._id,
        })
      } catch {} // ignore duplicate key errors
    }
  }

  console.log('Created attendance records')
  console.log('\n✅ Seed complete!')
  console.log('\nDemo accounts:')
  console.log('  Admin:   admin@school.edu / admin123')
  console.log('  Teacher: sarah@school.edu / teacher123')
  console.log('  Student: alice@school.edu / student123')

  await mongoose.disconnect()
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
