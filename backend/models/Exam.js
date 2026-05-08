const mongoose = require('mongoose')

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: { type: [String], required: true, validate: (v) => v.length === 4 },
  correctAnswer: { type: Number, required: true, min: 0, max: 3 },
})

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    duration: { type: Number, required: true, min: 1 }, // minutes
    scheduledAt: { type: Date, required: true },
    endsAt: { type: Date, required: true },
    instructions: { type: String, default: '' },
    published: { type: Boolean, default: false },
    questions: [questionSchema],
  },
  { timestamps: true }
)

module.exports = mongoose.model('Exam', examSchema)
