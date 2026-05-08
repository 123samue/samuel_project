import React, { useEffect, useState } from 'react'
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome, {user?.name} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your classes and exams</p>
        </div>
        <span className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full">Teacher</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { value: stats?.totalStudents, label: 'Total Students', color: 'text-sky-600' },
          { value: stats?.totalExams, label: 'Exams Created', color: 'text-violet-600' },
          { value: `${stats?.avgClassScore ?? '--'}%`, label: 'Class Avg Score', color: 'text-emerald-600' },
          { value: `${stats?.todayAttendance ?? '--'}%`, label: "Today's Attendance", color: 'text-amber-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value ?? '--'}</p>
            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">📝 Recent Exams</h2>
            <Link to="/teacher/exams/create" className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              + New Exam
            </Link>
          </div>
          {recentExams.length === 0 ? (
            <p className="text-slate-400 text-sm">No exams yet.</p>
          ) : (
            <div className="space-y-3">
              {recentExams.map((ex) => (
                <div key={ex._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{ex.title}</p>
                    <p className="text-xs text-slate-400">{ex.submissionCount} submissions · avg {ex.avgScore ?? '--'}%</p>
                  </div>
                  <Link to={`/teacher/exams/${ex._id}/results`} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                    Results
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-800">📋 Quick Attendance</h2>
            <Link to="/teacher/attendance" className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
              Mark Now
            </Link>
          </div>
          <p className="text-slate-400 text-sm">Go to Attendance to mark today's class attendance for your students.</p>
        </div>
      </div>
    </>
  )
}
