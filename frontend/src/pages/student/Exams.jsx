import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function StudentExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/exams/available').then(({ data }) => {
      setExams(data)
    }).finally(() => setLoading(false))
  }, [])

  const statusBadge = (exam) => {
    if (exam.submitted) return <span className="badge badge-green">Submitted</span>
    const now = new Date()
    const start = new Date(exam.scheduledAt)
    const end = new Date(exam.endsAt)
    if (now < start) return <span className="badge badge-blue">Upcoming</span>
    if (now > end) return <span className="badge badge-red">Expired</span>
    return <span className="badge badge-yellow">Open</span>
  }

  const canTake = (exam) => {
    if (exam.submitted) return false
    const now = new Date()
    return now >= new Date(exam.scheduledAt) && now <= new Date(exam.endsAt)
  }

  return (
    <>
      <div className="topbar">
        <h1>📝 Exams</h1>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-muted">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="text-muted">No exams available.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Duration</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td><strong>{exam.title}</strong></td>
                  <td>{exam.course?.name}</td>
                  <td>{exam.duration} min</td>
                  <td>{new Date(exam.scheduledAt).toLocaleString()}</td>
                  <td>{statusBadge(exam)}</td>
                  <td>
                    {canTake(exam) ? (
                      <Link to={`/student/exams/${exam._id}/take`} className="btn btn-primary btn-sm">
                        Take Exam
                      </Link>
                    ) : exam.submitted ? (
                      <Link to="/student/results" className="btn btn-sm" style={{ background: '#eee' }}>
                        View Result
                      </Link>
                    ) : (
                      <span className="text-muted">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
