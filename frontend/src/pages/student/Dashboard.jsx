import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [upcomingExams, setUpcomingExams] = useState([])
  const [recentResults, setRecentResults] = useState([])

  useEffect(() => {
    api.get('/students/dashboard').then(({ data }) => {
      setStats(data.stats)
      setUpcomingExams(data.upcomingExams || [])
      setRecentResults(data.recentResults || [])
    }).catch(() => {})
  }, [])

  return (
    <>
      <div className="topbar">
        <h1>Welcome, {user?.name} 👋</h1>
        <span className="user-badge">Student</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.attendanceRate ?? '--'}%</div>
          <div className="stat-label">Attendance Rate</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.examsTaken ?? '--'}</div>
          <div className="stat-label">Exams Taken</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.avgScore ?? '--'}%</div>
          <div className="stat-label">Average Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.upcomingExams ?? '--'}</div>
          <div className="stat-label">Upcoming Exams</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h2>📝 Upcoming Exams</h2>
          {upcomingExams.length === 0 ? (
            <p className="text-muted">No upcoming exams</p>
          ) : (
            <table>
              <thead>
                <tr><th>Exam</th><th>Course</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {upcomingExams.map((ex) => (
                  <tr key={ex._id}>
                    <td>{ex.title}</td>
                    <td>{ex.course?.name}</td>
                    <td>{new Date(ex.scheduledAt).toLocaleDateString()}</td>
                    <td>
                      <Link to={`/student/exams/${ex._id}/take`} className="btn btn-primary btn-sm">
                        Start
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>🏆 Recent Results</h2>
          {recentResults.length === 0 ? (
            <p className="text-muted">No results yet</p>
          ) : (
            <table>
              <thead>
                <tr><th>Exam</th><th>Score</th><th>Grade</th></tr>
              </thead>
              <tbody>
                {recentResults.map((r) => (
                  <tr key={r._id}>
                    <td>{r.exam?.title}</td>
                    <td>{r.score}%</td>
                    <td>
                      <span className={`badge ${r.score >= 50 ? 'badge-green' : 'badge-red'}`}>
                        {r.score >= 90 ? 'A' : r.score >= 75 ? 'B' : r.score >= 60 ? 'C' : r.score >= 50 ? 'D' : 'F'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  )
}
