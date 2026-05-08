import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'

export default function ExamResults() {
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/exams/${id}`),
      api.get(`/exams/${id}/results`),
    ]).then(([examRes, resultsRes]) => {
      setExam(examRes.data)
      setResults(resultsRes.data)
    }).finally(() => setLoading(false))
  }, [id])

  const avg = results.length
    ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length)
    : 0

  const grade = (score) => {
    if (score >= 90) return { label: 'A', cls: 'badge-green' }
    if (score >= 75) return { label: 'B', cls: 'badge-green' }
    if (score >= 60) return { label: 'C', cls: 'badge-blue' }
    if (score >= 50) return { label: 'D', cls: 'badge-yellow' }
    return { label: 'F', cls: 'badge-red' }
  }

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>

  return (
    <>
      <div className="topbar">
        <h1>📊 {exam?.title} — Results</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{results.length}</div>
          <div className="stat-label">Submissions</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{avg}%</div>
          <div className="stat-label">Class Average</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{results.length ? Math.max(...results.map((r) => r.score)) : '--'}%</div>
          <div className="stat-label">Highest Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{results.length ? Math.min(...results.map((r) => r.score)) : '--'}%</div>
          <div className="stat-label">Lowest Score</div>
        </div>
      </div>

      <div className="card">
        <h2>Student Results</h2>
        {results.length === 0 ? (
          <p className="text-muted">No submissions yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Student</th>
                <th>Score</th>
                <th>Grade</th>
                <th>Correct</th>
                <th>Submitted At</th>
              </tr>
            </thead>
            <tbody>
              {results
                .sort((a, b) => b.score - a.score)
                .map((r) => {
                  const g = grade(r.score)
                  return (
                    <tr key={r._id}>
                      <td>{r.student?.name}</td>
                      <td>
                        <strong>{r.score}%</strong>
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${r.score}%`, background: r.score >= 50 ? '#27ae60' : '#e74c3c' }} />
                        </div>
                      </td>
                      <td><span className={`badge ${g.cls}`}>{g.label}</span></td>
                      <td>{r.correctAnswers}/{r.totalQuestions}</td>
                      <td>{new Date(r.submittedAt).toLocaleString()}</td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
