import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import api from '../../api/axios'

const grade = (score) => {
  if (score >= 90) return { label: 'A', cls: 'bg-emerald-100 text-emerald-700' }
  if (score >= 75) return { label: 'B', cls: 'bg-emerald-100 text-emerald-700' }
  if (score >= 60) return { label: 'C', cls: 'bg-sky-100 text-sky-700' }
  if (score >= 50) return { label: 'D', cls: 'bg-amber-100 text-amber-700' }
  return { label: 'F', cls: 'bg-red-100 text-red-700' }
}

export default function ExamResults() {
  const { id } = useParams()
  const [exam, setExam] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([api.get(`/exams/${id}`), api.get(`/exams/${id}/results`)])
      .then(([e, r]) => { setExam(e.data); setResults(r.data) })
      .finally(() => setLoading(false))
  }, [id])

  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.score, 0) / results.length) : 0

  if (loading) return <div className="flex items-center justify-center h-64"><p className="text-slate-400">Loading...</p></div>

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📊 {exam?.title}</h1>
          <p className="text-slate-500 text-sm mt-1">Exam results overview</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { value: results.length, label: 'Submissions', color: 'text-sky-600' },
          { value: `${avg}%`, label: 'Class Average', color: 'text-violet-600' },
          { value: results.length ? `${Math.max(...results.map((r) => r.score))}%` : '--', label: 'Highest Score', color: 'text-emerald-600' },
          { value: results.length ? `${Math.min(...results.map((r) => r.score))}%` : '--', label: 'Lowest Score', color: 'text-red-500' },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-slate-500 text-sm mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-base font-semibold text-slate-800 mb-4">Student Results</h2>
        {results.length === 0 ? (
          <p className="text-slate-400 text-sm">No submissions yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Rank', 'Student', 'Score', 'Grade', 'Correct', 'Submitted At'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.sort((a, b) => b.score - a.score).map((r, i) => {
                  const g = grade(r.score)
                  return (
                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 text-slate-400 font-semibold">#{i + 1}</td>
                      <td className="py-3 px-4 font-semibold text-slate-700">{r.student?.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-700">{r.score}%</span>
                          <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${r.score >= 50 ? 'bg-emerald-500' : 'bg-red-400'}`} style={{ width: `${r.score}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${g.cls}`}>{g.label}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{r.correctAnswers}/{r.totalQuestions}</td>
                      <td className="py-3 px-4 text-slate-500">{new Date(r.submittedAt).toLocaleString()}</td>
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
