import { useEffect, useState } from 'react'
import api from '../../api/axios'

export default function StudentAttendance() {
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/attendance/my').then(({ data }) => {
      setRecords(data.records || [])
      setSummary(data.summary || {})
    }).finally(() => setLoading(false))
  }, [])

  const statusColor = (s) => {
    if (s === 'present') return 'badge-green'
    if (s === 'absent') return 'badge-red'
    return 'badge-yellow'
  }

  return (
    <>
      <div className="topbar">
        <h1>📋 My Attendance</h1>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#27ae60' }}>{summary.present ?? 0}</div>
          <div className="stat-label">Present</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#e74c3c' }}>{summary.absent ?? 0}</div>
          <div className="stat-label">Absent</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#f39c12' }}>{summary.late ?? 0}</div>
          <div className="stat-label">Late</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{summary.rate ?? 0}%</div>
          <div className="stat-label">Attendance Rate</div>
          <div className="progress-bar" style={{ marginTop: 8 }}>
            <div className="progress-fill" style={{ width: `${summary.rate ?? 0}%` }} />
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Attendance Records</h2>
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-muted">No attendance records found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Course</th>
                <th>Status</th>
                <th>Marked By</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r._id}>
                  <td>{new Date(r.date).toLocaleDateString()}</td>
                  <td>{r.course?.name || '—'}</td>
                  <td>
                    <span className={`badge ${statusColor(r.status)}`}>
                      {r.status}
                    </span>
                  </td>
                  <td>{r.markedBy?.name || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
