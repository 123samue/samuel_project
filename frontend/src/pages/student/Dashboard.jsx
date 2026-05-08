import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

function StatCard({ value, label, color = 'text-slate-800' }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
      <p className={`text-3xl font-bold ${color}`}>{value ?? '--'}</p>
      <p className="text-slate-500 text-sm mt-1">{label}</p>
    </div>
  )
}

export default function StudentDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [upcomingExams, setUpcomingExams] = useState([])
  const [recentResults, setRecentResults] = useState([])

  useEffect(() => {
    api.get('/students/dashboard').then(({ data }) => {
      setStats(data.stats)
      setUpcomingExams(data.upcomingExams || [])
      setRecentResults(data.recentResults || [])
    }).catch(() => {})
  }, [])

  const gradeLabel = (score) => {
    if (score >= 90) return 'A'
    if (score >= 75) return 'B'
    if (score >= 60) return 'C'
    if (score >= 50) return 'D'
    return 'F'
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome back, {user?.name} 👋</h1>
          <p className="text-slate-500 text-sm mt-1">Here's your learning overview</p>
        </div>
        <span className="bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-full">Student</span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard value={`${stats?.attendanceRate ?? '--'}%`} label="Attendance Rate" color="text-sky-600" />
        <StatCard value={stats?.examsTaken} label="Exams Taken" color="text-violet-600" />
        <StatCard value={`${stats?.avgScore ?? '--'}%`} label="Average Score" color="text-emerald-600" />
        <StatCard value={stats?.upcomingExams} label="Upcoming Exams" color="text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Exams */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">📝 Upcoming Exams</h2>
          {upcomingExams.length === 0 ? (
            <p className="text-slate-400 text-sm">No upcoming exams</p>
          ) : (
            <div className="space-y-3">
              {upcomingExams.map((ex) => (
                <div key={ex._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">{ex.title}</p>
                    <p className="text-xs text-slate-400">{ex.course?.name} · {new Date(ex.scheduledAt).toLocaleDateString()}</p>
                  </div>
                  <Link to={`/student/exams/${ex._id}/take`} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                    Start
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Results */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4">🏆 Recent Results</h2>
          {recentResults.length === 0 ? (
            <p className="text-slate-400 text-sm">No results yet</p>
          ) : (
            <div className="space-y-3">
              {recentResults.map((r) => (
                <div key={r._id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <p className="text-sm font-semibold text-slate-700">{r.exam?.title}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-700">{r.score}%</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${r.score >= 50 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {gradeLabel(r.score)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
