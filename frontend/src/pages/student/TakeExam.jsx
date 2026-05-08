import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function TakeExam() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [exam, setExam] = useState(null)
  const [answers, setAnswers] = useState({})
  const [timeLeft, setTimeLeft] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const timerRef = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    api.get(`/exams/${id}/take`).then(({ data }) => {
      setExam(data)
      setTimeLeft(data.duration * 60)
    }).catch(() => {
      toast.error('Exam not available')
      navigate('/student/exams')
    })
  }, [id, navigate])

  const handleSubmit = useCallback(async () => {
    if (submitting || submitted) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/exams/${id}/submit`, { answers })
      setSubmitted(true)
      clearInterval(timerRef.current)
      toast.success(`Submitted! Score: ${data.score}%`)
      setTimeout(() => navigate('/student/results'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }, [id, answers, submitting, submitted, navigate])

  useEffect(() => {
    if (timeLeft === null || startedRef.current) return
    startedRef.current = true
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(timerRef.current); handleSubmit(); return 0 }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft])

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`
  const isWarning = timeLeft !== null && timeLeft < 120

  if (!exam) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-400">Loading exam...</p>
    </div>
  )

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📝 {exam.title}</h1>
          <p className="text-slate-500 text-sm mt-1">{exam.course?.name} · {exam.questions?.length} questions · {exam.duration} min</p>
        </div>
        <div className={`font-mono font-bold text-lg px-5 py-2 rounded-full ${isWarning ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-800 text-white'}`}>
          ⏱ {timeLeft !== null ? fmt(timeLeft) : '--:--'}
        </div>
      </div>

      {exam.instructions && (
        <div className="bg-sky-50 border border-sky-200 rounded-xl p-4 mb-6 text-sm text-sky-800">
          📌 {exam.instructions}
        </div>
      )}

      <div className="space-y-4 mb-8">
        {exam.questions?.map((q, idx) => (
          <div key={q._id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <p className="font-semibold text-slate-800 mb-4">{idx + 1}. {q.text}</p>
            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <label
                  key={oi}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${
                    answers[q._id] === oi
                      ? 'border-slate-800 bg-slate-50'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={`q_${q._id}`}
                    value={oi}
                    checked={answers[q._id] === oi}
                    onChange={() => setAnswers({ ...answers, [q._id]: oi })}
                    disabled={submitted}
                    className="accent-slate-800"
                  />
                  <span className="text-sm text-slate-700">{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
        <p className="text-sm text-slate-500">
          Answered: <span className="font-bold text-slate-700">{Object.keys(answers).length}</span> / {exam.questions?.length}
        </p>
        <button
          onClick={handleSubmit}
          disabled={submitting || submitted}
          className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
        >
          {submitting ? 'Submitting...' : submitted ? '✓ Submitted' : 'Submit Exam'}
        </button>
      </div>
    </>
  )
}
