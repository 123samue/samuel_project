import { useEffect, useState, useRef, useCallback } from 'react'
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

  useEffect(() => {
    api.get(`/exams/${id}/take`).then(({ data }) => {
      setExam(data)
      setTimeLeft(data.duration * 60)
    }).catch(() => {
      toast.error('Exam not available')
      navigate('/student/exams')
    })
  }, [id, navigate])

  const handleSubmit = useCallback(async (auto = false) => {
    if (submitting || submitted) return
    setSubmitting(true)
    try {
      const { data } = await api.post(`/exams/${id}/submit`, { answers })
      setSubmitted(true)
      clearInterval(timerRef.current)
      toast.success(`Exam submitted! Score: ${data.score}%`)
      setTimeout(() => navigate('/student/results'), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }, [id, answers, submitting, submitted, navigate])

  useEffect(() => {
    if (timeLeft === null) return
    if (timeLeft <= 0) {
      handleSubmit(true)
      return
    }
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current)
          handleSubmit(true)
          return 0
        }
        return t - 1
      })
    }, 1000)
    return () => clearInterval(timerRef.current)
  }, [timeLeft === null]) // only start once

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0')
    const s = (secs % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  if (!exam) return <div style={{ padding: 40 }}>Loading exam...</div>

  return (
    <>
      <div className="topbar">
        <h1>📝 {exam.title}</h1>
        <div className={`exam-timer ${timeLeft !== null && timeLeft < 120 ? 'warning' : ''}`}>
          ⏱ {timeLeft !== null ? formatTime(timeLeft) : '--:--'}
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <p><strong>Course:</strong> {exam.course?.name} &nbsp;|&nbsp;
          <strong>Questions:</strong> {exam.questions?.length} &nbsp;|&nbsp;
          <strong>Duration:</strong> {exam.duration} min
        </p>
        {exam.instructions && (
          <p style={{ marginTop: 8, color: '#555' }}>{exam.instructions}</p>
        )}
      </div>

      {exam.questions?.map((q, idx) => (
        <div key={q._id} className="exam-question">
          <p>{idx + 1}. {q.text}</p>
          <div className="exam-options">
            {q.options.map((opt, oi) => (
              <label key={oi}>
                <input
                  type="radio"
                  name={`q_${q._id}`}
                  value={oi}
                  checked={answers[q._id] === oi}
                  onChange={() => setAnswers({ ...answers, [q._id]: oi })}
                  disabled={submitted}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      ))}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
        <p className="text-muted">
          Answered: {Object.keys(answers).length} / {exam.questions?.length}
        </p>
        <button
          className="btn btn-success"
          onClick={() => handleSubmit(false)}
          disabled={submitting || submitted}
        >
          {submitting ? 'Submitting...' : submitted ? 'Submitted ✓' : 'Submit Exam'}
        </button>
      </div>
    </>
  )
}
