import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function TeacherDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentExams, setRecentExams] = useState([])

  useEffect(() => {
    api.get('/teachers/dashboard').then(({ data }) => {
      setStats(data.stats)
      setRecentExams(data.recentExams || [])
    }).catch(() => {})
  }, [])

  return (
    <>
      <div className="topbar">
        <h1>Welcome, {user?.name} 👋</h1>
        <span className="user-badge">Teacher</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalStudents ?? '--'}</div>
          <div className="stat-label">Total Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalExams ?? '--'}</div>
          <div className="stat-label">Exams Created</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.avgClassScore ?? '--'}%</div>
          <div className="stat-label">Class Avg Score</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.todayAttendance ?? '--'}%</div>
          <div className="stat-label">Today's Attendance</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>📝 Recent Exams</h2>
            <Link to="/teacher/exams/create" className="btn btn-primary btn-sm">+ New Exam</Link>
          </div>
          {recentExams.length === 0 ? (
            <p className="text-muted">No exams yet.</p>
          ) : (
            <table>
              <thead>
                <tr><th>Title</th><th>Submissions</th><th>Avg</th><th></th></tr>
              </thead>
              <tbody>
                {recentExams.map((ex) => (
                  <tr key={ex._id}>
                    <td>{ex.title}</td>
                    <td>{ex.submissionCount}</td>
                    <td>{ex.avgScore ?? '--'}%</td>
                    <td>
                      <Link to={`/teacher/exams/${ex._id}/results`} className="btn btn-sm" style={{ background: '#eee' }}>
                        Results
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h2>📋 Quick Attendance</h2>
            <Link to="/teacher/attendance" className="btn btn-primary btn-sm">Mark Now</Link>
          </div>
          <p className="text-muted">Go to Attendance to mark today's class attendance for your students.</p>
        </div>
      </div>
    </>
  )
}
