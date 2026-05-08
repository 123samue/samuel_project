import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function ManageCourses() {
  const [courses, setCourses] = useState([])
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', teacher: '' })
  const [saving, setSaving] = useState(false)

  const fetchData = () => {
    Promise.all([
      api.get('/courses'),
      api.get('/admin/users?role=teacher'),
    ]).then(([c, t]) => {
      setCourses(c.data)
      setTeachers(t.data)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const createCourse = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/courses', form)
      toast.success('Course created!')
      setShowForm(false)
      setForm({ name: '', description: '', teacher: '' })
      fetchData()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course')
    } finally {
      setSaving(false)
    }
  }

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return
    try {
      await api.delete(`/courses/${id}`)
      toast.success('Course deleted')
      fetchData()
    } catch {
      toast.error('Failed to delete')
    }
  }

  return (
    <>
      <div className="topbar">
        <h1>📚 Manage Courses</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showForm && (
        <div className="card">
          <h2>Create Course</h2>
          <form onSubmit={createCourse}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label>Course Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Mathematics 101" />
              </div>
              <div className="form-group">
                <label>Assign Teacher</label>
                <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}>
                  <option value="">Select teacher...</option>
                  {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description..." />
            </div>
            <button type="submit" className="btn btn-success" disabled={saving}>
              {saving ? 'Creating...' : 'Create Course'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-muted">No courses yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Course Name</th>
                <th>Description</th>
                <th>Teacher</th>
                <th>Students</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c._id}>
                  <td><strong>{c.name}</strong></td>
                  <td>{c.description || '—'}</td>
                  <td>{c.teacher?.name || '—'}</td>
                  <td>{c.studentCount ?? 0}</td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => deleteCourse(c._id)}>
                      Delete
                    </button>
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
