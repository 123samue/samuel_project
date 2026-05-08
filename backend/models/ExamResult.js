const mongoose = require('mongoose')

const examResultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    answers: { type: Map, of: Number }, // questionId -> selected option index
    score: { type: Number, required: true }, // percentage 0-100
    correctAnswers: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
    reviewData: [
      {
        questionText: String,
        yourAnswer: String,
        correctAnswer: String,
        correct: Boolean,
      },
    ],
  },
  { timestamps: true }
)

// One submission per student per exam
examResultSchema.index({ exam: 1, student: 1 }, { unique: true })

module.exports = mongoose.model('ExamResult', examResultSchema)
