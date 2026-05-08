import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function StudentResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/exams/my-results').then(({ data }) => {
      setResults(data)
    }).finally(() => setLoading(false))
  }, [])

  const grade = (score) => {
    if (score >= 90) return { label: 'A', cls: 'badge-green' }
    if (score >= 75) return { label: 'B', cls: 'badge-green' }
    if (score >= 60) return { label: 'C', cls: 'badge-blue' }
    if (score >= 50) return { label: 'D', cls: 'badge-yellow' }
    return { label: 'F', cls: 'badge-red' }
  }

  return (
    <>
      <div className="topbar">
        <h1>🏆 My Results</h1>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-muted">Loading results...</p>
        ) : results.length === 0 ? (
          <p className="text-muted">No results yet. Take an exam first!</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Exam</th>
                <th>Course</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Correct</th>
                <th>Date</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r) => {
                const g = grade(r.score)
                return (
                  <tr key={r._id}>
                    <td><strong>{r.exam?.title}</strong></td>
                    <td>{r.exam?.course?.name}</td>
                    <td>
                      <strong>{r.score}%</strong>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${r.score}%`, background: r.score >= 50 ? '#27ae60' : '#e74c3c' }} />
                      </div>
                    </td>
                    <td><span className={`badge ${g.cls}`}>{g.label}</span></td>
                    <td>{r.correctAnswers}/{r.totalQuestions}</td>
                    <td>{new Date(r.submittedAt).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-sm" style={{ background: '#eee' }} onClick={() => setSelected(r)}>
                        Review
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: 32, maxWidth: 600, width: '90%', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h2>{selected.exam?.title} — Review</h2>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer' }}>✕</button>
            </div>
            <p className="text-muted" style={{ marginBottom: 16 }}>
              Score: <strong>{selected.score}%</strong> &nbsp;|&nbsp;
              {selected.correctAnswers}/{selected.totalQuestions} correct
            </p>
            {selected.reviewData?.map((item, i) => (
              <div key={i} style={{
                background: item.correct ? '#d4edda' : '#f8d7da',
                borderRadius: 8, padding: 14, marginBottom: 10
              }}>
                <p style={{ fontWeight: 600, marginBottom: 6 }}>{i + 1}. {item.questionText}</p>
                <p>Your answer: <strong>{item.yourAnswer ?? 'Not answered'}</strong></p>
                {!item.correct && <p>Correct answer: <strong>{item.correctAnswer}</strong></p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  )
}
