import React, { useEffect, useState } from 'react'
import api from '../../api/axios'

const grade = (score) => {
  if (score >= 90) return { label: 'A', cls: 'bg-emerald-100 text-emerald-700' }
  if (score >= 75) return { label: 'B', cls: 'bg-emerald-100 text-emerald-700' }
  if (score >= 60) return { label: 'C', cls: 'bg-sky-100 text-sky-700' }
  if (score >= 50) return { label: 'D', cls: 'bg-amber-100 text-amber-700' }
  return { label: 'F', cls: 'bg-red-100 text-red-700' }
}

export default function StudentResults() {
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/exams/my-results').then(({ data }) => setResults(data)).finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">🏆 My Results</h1>
          <p className="text-slate-500 text-sm mt-1">Review your exam performance</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading results...</p>
        ) : results.length === 0 ? (
          <p className="text-slate-400 text-sm">No results yet. Take an exam first!</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Exam', 'Course', 'Score', 'Grade', 'Correct', 'Date', ''].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {results.map((r) => {
                  const g = grade(r.score)
                  return (
                    <tr key={r._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-slate-700">{r.exam?.title}</td>
                      <td className="py-3 px-4 text-slate-500">{r.exam?.course?.name}</td>
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
                      <td className="py-3 px-4 text-slate-500">{new Date(r.submittedAt).toLocaleDateString()}</td>
                      <td className="py-3 px-4">
                        <button onClick={() => setSelected(r)} className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-3 py-1.5 rounded-lg transition-colors">
                          Review
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <h2 className="font-bold text-slate-800">{selected.exam?.title}</h2>
                <p className="text-sm text-slate-500 mt-0.5">Score: {selected.score}% · {selected.correctAnswers}/{selected.totalQuestions} correct</p>
              </div>
              <button onClick={() => setSelected(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>
            <div className="p-6 space-y-3">
              {selected.reviewData?.map((item, i) => (
                <div key={i} className={`rounded-xl p-4 ${item.correct ? 'bg-emerald-50 border border-emerald-100' : 'bg-red-50 border border-red-100'}`}>
                  <p className="font-semibold text-sm text-slate-800 mb-2">{i + 1}. {item.questionText}</p>
                  <p className="text-sm text-slate-600">Your answer: <strong>{item.yourAnswer ?? 'Not answered'}</strong></p>
                  {!item.correct && <p className="text-sm text-emerald-700 mt-1">Correct: <strong>{item.correctAnswer}</strong></p>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
