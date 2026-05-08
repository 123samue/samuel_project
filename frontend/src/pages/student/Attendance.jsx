import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

const statusStyle = {
  present: 'bg-emerald-100 text-emerald-700',
  absent: 'bg-red-100 text-red-700',
  late: 'bg-amber-100 text-amber-700',
}

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

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📋 My Attendance</h1>
          <p className="text-slate-500 text-sm mt-1">Track your class attendance</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { value: summary.present ?? 0, label: 'Present', color: 'text-emerald-600' },
          { value: summary.absent ?? 0, label: 'Absent', color: 'text-red-500' },
          { value: summary.late ?? 0, label: 'Late', color: 'text-amber-500' },
          { value: `${summary.rate ?? 0}%`, label: 'Attendance Rate', color: 'text-sky-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
            {s.label === 'Attendance Rate' && (
              <div className="mt-3 h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full transition-all" style={{ width: `${summary.rate ?? 0}%` }} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Records table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Attendance Records</h2>
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : records.length === 0 ? (
          <p className="text-slate-400 text-sm">No attendance records found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Date</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Course</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Marked By</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r) => (
                  <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 text-slate-700">{new Date(r.date).toLocaleDateString()}</td>
                    <td className="py-3 px-4 text-slate-700">{r.course?.name || '—'}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusStyle[r.status]}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{r.markedBy?.name || '—'}</td>
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
