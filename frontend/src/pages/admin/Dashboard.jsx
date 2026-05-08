import { useEffect, useState } from 'react'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)

  useEffect(() => {
    api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {})
  }, [])

  return (
    <>
      <div className="topbar">
        <h1>Admin Dashboard</h1>
        <span className="user-badge">Admin</span>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{stats?.totalStudents ?? '--'}</div>
          <div className="stat-label">Students</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalTeachers ?? '--'}</div>
          <div className="stat-label">Teachers</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalCourses ?? '--'}</div>
          <div className="stat-label">Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{stats?.totalExams ?? '--'}</div>
          <div className="stat-label">Exams</div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card">
          <h2>📊 Platform Overview</h2>
          <table>
            <tbody>
              <tr><td>Total Users</td><td><strong>{(stats?.totalStudents ?? 0) + (stats?.totalTeachers ?? 0)}</strong></td></tr>
              <tr><td>Active Exams</td><td><strong>{stats?.activeExams ?? '--'}</strong></td></tr>
              <tr><td>Submissions Today</td><td><strong>{stats?.submissionsToday ?? '--'}</strong></td></tr>
              <tr><td>Avg Attendance Rate</td><td><strong>{stats?.avgAttendance ?? '--'}%</strong></td></tr>
            </tbody>
          </table>
        </div>
        <div className="card">
          <h2>🔔 Quick Actions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <a href="/admin/users" className="btn btn-primary">Manage Users</a>
            <a href="/admin/courses" className="btn btn-primary" style={{ background: '#2980b9' }}>Manage Courses</a>
          </div>
        </div>
      </div>
    </>
  )
}
