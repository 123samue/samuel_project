import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const emptyQuestion = () => ({ text: '', options: ['', '', '', ''], correctAnswer: 0 })

export default function CreateExam() {
  const navigate = useNavigate()
  const [courses, setCourses] = useState([])
  const [form, setForm] = useState({ title: '', course: '', duration: 30, scheduledAt: '', endsAt: '', instructions: '', published: false })
  const [questions, setQuestions] = useState([emptyQuestion()])
  const [saving, setSaving] = useState(false)

  useEffect(() => { api.get('/courses/my').then(({ data }) => setCourses(data)) }, [])

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].text.trim()) { toast.error(`Question ${i + 1} text is empty`); return }
      if (questions[i].options.some((o) => !o.trim())) { toast.error(`Question ${i + 1} has empty options`); return }
    }
    setSaving(true)
    try {
      await api.post('/exams', { ...form, questions })
      toast.success('Exam created!')
      navigate('/teacher/exams')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create exam')
    } finally { setSaving(false) }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📝 Create Exam</h1>
          <p className="text-slate-500 text-sm mt-1">Build a new exam for your students</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Exam details */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Exam Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              { label: 'Title', key: 'title', type: 'text', placeholder: 'Midterm Exam', required: true },
            ].map(({ label, key, type, placeholder, required }) => (
              <div key={key}>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">{label}</label>
                <input type={type} placeholder={placeholder} value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} required={required}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
            ))}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Course *</label>
              <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="">Select course...</option>
                {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Duration (minutes) *</label>
              <input type="number" min={5} max={300} value={form.duration} onChange={(e) => setForm({ ...form, duration: +e.target.value })} required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Scheduled At *</label>
              <input type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Ends At *</label>
              <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} required
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Visibility</label>
              <select value={form.published} onChange={(e) => setForm({ ...form, published: e.target.value === 'true' })}
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                <option value="false">Save as Draft</option>
                <option value="true">Publish Now</option>
              </select>
            </div>
          </div>
          <div className="mt-5">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Instructions</label>
            <textarea rows={2} value={form.instructions} onChange={(e) => setForm({ ...form, instructions: e.target.value })} placeholder="Any special instructions..."
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-800">Questions ({questions.length})</h2>
            <button type="button" onClick={() => setQuestions([...questions, emptyQuestion()])}
              className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              + Add Question
            </button>
          </div>

          <div className="space-y-4">
            {questions.map((q, qi) => (
              <div key={qi} className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-semibold text-slate-700">Question {qi + 1}</span>
                  <button type="button" onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}
                    disabled={questions.length === 1}
                    className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-40">
                    Remove
                  </button>
                </div>
                <textarea rows={2} value={q.text} onChange={(e) => updateQuestion(qi, 'text', e.target.value)} placeholder="Enter your question..."
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none mb-4" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 w-5">{String.fromCharCode(65 + oi)}</span>
                      <input value={opt} onChange={(e) => updateOption(qi, oi, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                        className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Correct Answer</label>
                  <select value={q.correctAnswer} onChange={(e) => updateQuestion(qi, 'correctAnswer', +e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                    {q.options.map((_, oi) => (
                      <option key={oi} value={oi}>Option {String.fromCharCode(65 + oi)}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <button type="button" onClick={() => navigate('/teacher/exams')}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60">
            {saving ? 'Creating...' : 'Create Exam'}
          </button>
        </div>
      </form>
    </>
  )
}
