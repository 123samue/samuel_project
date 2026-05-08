const mongoose = require('mongoose')

const courseSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    teacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

// Virtual for student count
courseSchema.virtual('studentCount').get(function () {
  return this.students.length
})

courseSchema.set('toJSON', { virtuals: true })
courseSchema.set('toObject', { virtuals: true })

module.exports = mongoose.model('Course', courseSchema)
