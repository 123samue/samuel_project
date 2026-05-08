import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function ManageExams() {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchExams = () => {
    api.get('/exams/my').then(({ data }) => setExams(data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchExams() }, [])

  const deleteExam = async (id) => {
    if (!window.confirm('Delete this exam?')) return
    try { await api.delete(`/exams/${id}`); toast.success('Deleted'); fetchExams() }
    catch { toast.error('Failed to delete') }
  }

  const togglePublish = async (exam) => {
    try { await api.patch(`/exams/${exam._id}`, { published: !exam.published }); fetchExams() }
    catch { toast.error('Failed to update') }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">📝 Manage Exams</h1>
          <p className="text-slate-500 text-sm mt-1">Create and manage your exams</p>
        </div>
        <Link to="/teacher/exams/create" className="bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
          + Create Exam
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : exams.length === 0 ? (
          <p className="text-slate-400 text-sm">No exams yet. <Link to="/teacher/exams/create" className="text-sky-600 hover:underline">Create one!</Link></p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Title', 'Course', 'Questions', 'Duration', 'Scheduled', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {exams.map((exam) => (
                  <tr key={exam._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-700">{exam.title}</td>
                    <td className="py-3 px-4 text-slate-500">{exam.course?.name}</td>
                    <td className="py-3 px-4 text-slate-500">{exam.questions?.length}</td>
                    <td className="py-3 px-4 text-slate-500">{exam.duration} min</td>
                    <td className="py-3 px-4 text-slate-500">{new Date(exam.scheduledAt).toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${exam.published ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {exam.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => togglePublish(exam)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${exam.published ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}
                        >
                          {exam.published ? 'Unpublish' : 'Publish'}
                        </button>
                        <Link to={`/teacher/exams/${exam._id}/results`} className="text-xs bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg hover:bg-slate-200 transition-colors">
                          Results
                        </Link>
                        <button onClick={() => deleteExam(exam._id)} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
                          Delete
                        </button>
                      </div>
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
