import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function ManageAttendance() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [students, setStudents] = useState([])
  const [attendance, setAttendance] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [history, setHistory] = useState([])

  useEffect(() => {
    api.get('/courses/my').then(({ data }) => setCourses(data))
  }, [])

  const loadStudents = async () => {
    if (!selectedCourse) return
    setLoading(true)
    try {
      const { data } = await api.get(`/attendance/sheet?course=${selectedCourse}&date=${date}`)
      setStudents(data.students)
      const init = {}
      data.students.forEach((s) => {
        init[s._id] = data.existing?.[s._id] || 'present'
      })
      setAttendance(init)
    } catch {
      toast.error('Failed to load students')
    } finally {
      setLoading(false)
    }
  }

  const saveAttendance = async () => {
    setSaving(true)
    try {
      await api.post('/attendance/mark', {
        course: selectedCourse,
        date,
        records: Object.entries(attendance).map(([student, status]) => ({ student, status })),
      })
      toast.success('Attendance saved!')
      loadHistory()
    } catch {
      toast.error('Failed to save attendance')
    } finally {
      setSaving(false)
    }
  }

  const loadHistory = async () => {
    if (!selectedCourse) return
    const { data } = await api.get(`/attendance/history?course=${selectedCourse}`)
    setHistory(data)
  }

  useEffect(() => {
    if (selectedCourse) loadHistory()
  }, [selectedCourse])

  const statusColor = { present: '#27ae60', absent: '#e74c3c', late: '#f39c12' }

  return (
    <>
      <div className="topbar">
        <h1>📋 Manage Attendance</h1>
      </div>

      <div className="card">
        <h2>Mark Attendance</h2>
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 200 }}>
            <label>Course</label>
            <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
              <option value="">Select course...</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label>Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btn-primary" onClick={loadStudents} disabled={!selectedCourse}>
              Load Students
            </button>
          </div>
        </div>

        {loading && <p className="text-muted">Loading...</p>}

        {students.length > 0 && (
          <>
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s._id}>
                    <td>{s.name}</td>
                    <td>{s.email}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {['present', 'absent', 'late'].map((status) => (
                          <button
                            key={status}
                            onClick={() => setAttendance({ ...attendance, [s._id]: status })}
                            style={{
                              padding: '4px 12px',
                              borderRadius: 6,
                              border: '2px solid',
                              borderColor: attendance[s._id] === status ? statusColor[status] : '#ddd',
                              background: attendance[s._id] === status ? statusColor[status] : '#fff',
                              color: attendance[s._id] === status ? '#fff' : '#555',
                              cursor: 'pointer',
                              fontSize: '0.82rem',
                              fontWeight: 600,
                              textTransform: 'capitalize',
                            }}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <button className="btn btn-success" onClick={saveAttendance} disabled={saving}>
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}
      </div>

      {history.length > 0 && (
        <div className="card">
          <h2>Attendance History</h2>
          <table>
            <thead>
              <tr><th>Date</th><th>Present</th><th>Absent</th><th>Late</th><th>Rate</th></tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i}>
                  <td>{new Date(h.date).toLocaleDateString()}</td>
                  <td style={{ color: '#27ae60' }}>{h.present}</td>
                  <td style={{ color: '#e74c3c' }}>{h.absent}</td>
                  <td style={{ color: '#f39c12' }}>{h.late}</td>
                  <td>
                    <strong>{h.rate}%</strong>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${h.rate}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
