import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const emptyQuestion = () => ({
  text: '',
  options: ['', '', '', ''],
  correctAnswer: 0,
})

export default function CreateExam() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({
    title: '',
    course: '',
    duration: 30,
    scheduledAt: '',
    endsAt: '',
    instructions: '',
    published: false,
  })
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/courses/my').then(({ data }) => setCourses(data))
  }, [])

  const updateQuestion = (idx, field, value) => {
    const updated = [...questions]
    updated[idx] = { ...updated[idx], [field]: value }
    setQuestions(updated)
  }

  const updateOption = (qIdx, oIdx, value) => {
    const updated = [...questions]
    const opts = [...updated[qIdx].options]
    opts[oIdx] = value
    updated[qIdx] = { ...updated[qIdx], options: opts }
    setQuestions(updated)
  }

  const addQuestion = () => setQuestions([...questions, emptyQuestion()])

  const removeQuestion = (idx) => {
    if (questions.length === 1) return
    setQuestions(questions.filter((_, i) => i !== idx))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    // Validate
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i]
      if (!q.text.trim()) { toast.error(`Question ${i + 1} text is empty`); return }
      if (q.options.some((o) => !o.trim())) { toast.error(`Question ${i + 1} has empty options`); return }
    }
    setSaving(true)
    try {
      await api.post('/exams', { ...form, questions })
      toast.success('Exam created!')
      navigate('/teacher/exams')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam')
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <div className="topbar">
        <h1>📝 Create Exam</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Exam Details</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Midterm Exam" />
            </div>
            <div className="form-group">
              <label>Course *</label>
              <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required>
                <option value="">Select course...</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Duration (minutes) *</label>
              <input type="number" min={5} max={300} value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Scheduled At *</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Ends At *</label>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>Publish immediately</label>
              <select value={form.published} onChange={(e) => setForm({ ...form, published: e.target.value === 'true' })}>
                <option value="false">Save as Draft</option>
                <option value="true">Publish Now</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Instructions</label>
            <textarea rows={3} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Any special instructions for students..." />
          </div>
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>Questions ({questions.length})</h2>
            <button type="button" className="btn btn-primary btn-sm" onClick={addQuestion}>+ Add Question</button>
          </div>

          {questions.map((q, qi) => (
            <div key={qi} style={{ background: '#f7f9fc', borderRadius: 10, padding: 20, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <strong>Question {qi + 1}</strong>
                <button type="button" className="btn btn-danger btn-sm" onClick={() => removeQuestion(qi)}>Remove</button>
              </div>
              <div className="form-group">
                <label>Question Text *</label>
                <textarea
                  rows={2}
                  value={q.text}
                  onChange={(e) => updateQuestion(qi, 'text', e.target.value)}
                  placeholder="Enter your question..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                {q.options.map((opt, oi) => (
                  <div className="form-group" key={oi} style={{ marginBottom: 0 }}>
                    <label>Option {String.fromCharCode(65 + oi)}</label>
                    <input
                      value={opt}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                    />
                  </div>
                ))}
              </div>
              <div className="form-group">
                <label>Correct Answer</label>
                <select value={q.correctAnswer} onChange={(e) => updateQuestion(qi, 'correctAnswer', +e.target.value)}>
                  {q.options.map((_, oi) => (
                    <option key={oi} value={oi}>Option {String.fromCharCode(65 + oi)}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
          <button type="button" className="btn" style={{ background: '#eee' }} onClick={() => navigate('/teacher/exams')}>
            Cancel
          </button>
          <button type="submit" className="btn btn-success" disabled={saving}>
            {saving ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </>
  )
}
