import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const statusConfig = {
  present: { label: 'Present', active: 'bg-emerald-500 text-white border-emerald-500', idle: 'border-slate-200 text-slate-500 hover:border-emerald-400' },
  absent:  { label: 'Absent',  active: 'bg-red-500 text-white border-red-500',     idle: 'border-slate-200 text-slate-500 hover:border-red-400' },
  late:    { label: 'Late',    active: 'bg-amber-500 text-white border-amber-500',  idle: 'border-slate-200 text-slate-500 hover:border-amber-400' },
}

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
      data.students.forEach((s) => { init[s._id] = data.existing?.[s._id] || 'present' })
      setAttendance(init)
    } catch { toast.error('Failed to load students') }
    finally { setLoading(false) }
  }

  const saveAttendance = async () => {
    setSaving(true)
    try {
      await api.post('/attendance/mark', {
        course: selectedCourse, date,
        records: Object.entries(attendance).map(([student, status]) => ({ student, status })),
      })
      toast.success('Attendance saved!')
      loadHistory()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  const loadHistory = async () => {
    if (!selectedCourse) return
    const { data } = await api.get(`/attendance/history?course=${selectedCourse}`)
    setHistory(data)
  }

  useEffect(() => { if (selectedCourse) loadHistory() }, [selectedCourse])

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📋 Manage Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Mark and track student attendance</p>
        </div>
      </div>

      {/* Mark attendance */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Mark Attendance</h2>
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-48">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Course</label>
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Select course...</option>
              {courses.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-40">
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={loadStudents}
              disabled={!selectedCourse}
              className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-50"
            >
              Load Students
            </button>
          </div>
        </div>

        {loading && <p className="text-slate-400 text-sm">Loading...</p>}

        {students.length > 0 && (
          <>
            <div className="space-y-2 mb-5">
              {students.map((s) => (
                <div key={s._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{s.name}</p>
                    <p className="text-xs text-slate-400">{s.email}</p>
                  </div>
                  <div className="flex gap-2">
                    {Object.entries(statusConfig).map(([status, cfg]) => (
                      <button
                        key={status}
                        onClick={() => setAttendance({ ...attendance, [s._id]: status })}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${attendance[s._id] === status ? cfg.active : cfg.idle}`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end">
              <button
                onClick={saveAttendance}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Attendance'}
              </button>
            </div>
          </>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">Attendance History</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Date', 'Present', 'Absent', 'Late', 'Rate'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-700">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-emerald-600 font-semibold">{h.present}</td>
                    <td className="py-3 px-4 text-red-500 font-semibold">{h.absent}</td>
                    <td className="py-3 px-4 text-amber-500 font-semibold">{h.late}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-700">{h.rate}%</span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-sky-500 rounded-full" style={{ width: `${h.rate}%` }} />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}
