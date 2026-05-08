import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'

export default function StudentExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/exams/available').then(({ data }) => setExams(data)).finally(() => setLoading(false))
  }, [])

  const getStatus = (exam) => {
    if (exam.submitted) return { label: 'Submitted', cls: 'bg-emerald-100 text-emerald-700' }
    const now = new Date()
    if (now < new Date(exam.scheduledAt)) return { label: 'Upcoming', cls: 'bg-sky-100 text-sky-700' }
    if (now > new Date(exam.endsAt)) return { label: 'Expired', cls: 'bg-red-100 text-red-700' }
    return { label: 'Open', cls: 'bg-amber-100 text-amber-700' }
  }

  const canTake = (exam) => {
    if (exam.submitted) return false
    const now = new Date()
    return now >= new Date(exam.scheduledAt) && now <= new Date(exam.endsAt)
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📝 Exams</h1>
          <p className="text-slate-500 text-sm mt-1">Your available exams</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className="text-slate-400 text-sm">No exams available.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Title</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Course</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Duration</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Scheduled</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-slate-500 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => {
                  const status = getStatus(exam)
                  return (
                    <tr key={exam._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-700">{exam.title}</td>
                      <td className="py-3 px-4 text-slate-500">{exam.course?.name}</td>
                      <td className="py-3 px-4 text-slate-500">{exam.duration} min</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(exam.scheduledAt).toLocaleString()}</td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${status.cls}`}>{status.label}</span>
                      </td>
                      <td className="py-3 px-4">
                        {canTake(exam) ? (
                          <Link to={`/student/exams/${exam._id}/take`} className="text-xs bg-slate-800 text-white px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors">
                            Take Exam
                          </Link>
                        ) : exam.submitted ? (
                          <Link to="/student/results" className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                            View Result
                          </Link>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  )
}
