import React, { useEffect, useState } from 'react'
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
    Promise.all([api.get('/courses'), api.get('/admin/users?role=teacher')])
      .then(([c, t]) => { setCourses(c.data); setTeachers(t.data) })
      .finally(() => setLoading(false))
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
    } catch (err) { toast.error(err.response?.data?.message || 'Failed') }
    finally { setSaving(false) }
  }

  const deleteCourse = async (id) => {
    if (!window.confirm('Delete this course?')) return
    try { await api.delete(`/courses/${id}`); toast.success('Deleted'); fetchData() }
    catch { toast.error('Failed to delete') }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📚 Manage Courses</h1>
          <p className="text-slate-500 text-sm mt-1">{courses.length} courses</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          {showForm ? 'Cancel' : '+ New Course'}
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
          <h2 className="text-base font-semibold text-slate-800 mb-5">Create Course</h2>
          <form onSubmit={createCourse} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Course Name *</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Mathematics 101"
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Assign Teacher</label>
                <select value={form.teacher} onChange={(e) => setForm({ ...form, teacher: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500">
                  <option value="">Select teacher...</option>
                  {teachers.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Description</label>
              <textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Course description..."
                className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none" />
            </div>
            <div className="flex justify-end">
              <button type="submit" disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60">
                {saving ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : courses.length === 0 ? (
          <p className="text-slate-400 text-sm">No courses yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Course Name', 'Description', 'Teacher', 'Students', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-700">{c.name}</td>
                    <td className="py-3 px-4 text-slate-500">{c.description || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{c.teacher?.name || '—'}</td>
                    <td className="py-3 px-4 text-slate-500">{c.studentCount ?? 0}</td>
                    <td className="py-3 px-4">
                      <button onClick={() => deleteCourse(c._id)} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
