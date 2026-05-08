import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => { api.get('/admin/stats').then(({ data }) => setStats(data)).catch(() => {}) }, [])

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
          <p className="text-slate-500 text-sm mt-1">Platform overview</p>
        </div>
        <span className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full">Admin</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { value: stats?.totalStudents, label: 'Students', color: 'text-sky-600' },
          { value: stats?.totalTeachers, label: 'Teachers', color: 'text-violet-600' },
          { value: stats?.totalCourses, label: 'Courses', color: 'text-emerald-600' },
          { value: stats?.totalExams, label: 'Exams', color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? '--'}</p>
            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">📊 Platform Stats</h2>
          <div className="space-y-3">
            {[
              { label: 'Total Users', value: (stats?.totalStudents ?? 0) + (stats?.totalTeachers ?? 0) },
              { label: 'Active Exams', value: stats?.activeExams ?? '--' },
              { label: 'Submissions Today', value: stats?.submissionsToday ?? '--' },
              { label: 'Avg Attendance Rate', value: `${stats?.avgAttendance ?? '--'}%` },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{row.label}</span>
                <span className="text-sm font-bold text-slate-700">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">🔧 Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/users" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <span className="text-sm font-semibold text-slate-700">👥 Manage Users</span>
              <span className="text-slate-400">→</span>
            </Link>
            <Link to="/admin/courses" className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
              <span className="text-sm font-semibold text-slate-700">📚 Manage Courses</span>
              <span className="text-slate-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
