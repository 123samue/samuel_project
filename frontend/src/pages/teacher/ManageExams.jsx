import { useEffect, useState } from 'react'
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
    try {
      await api.delete(`/exams/${id}`)
      toast.success('Exam deleted')
      fetchExams()
    } catch {
      toast.error('Failed to delete')
    }
  }

  const togglePublish = async (exam) => {
    try {
      await api.patch(`/exams/${exam._id}`, { published: !exam.published })
      fetchExams()
    } catch {
      toast.error('Failed to update')
    }
  }

  return (
    <>
      <div className="topbar">
        <h1>📝 Manage Exams</h1>
        <Link to="/teacher/exams/create" className="btn btn-primary">+ Create Exam</Link>
      </div>

      <div className="card">
        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : exams.length === 0 ? (
          <p className="text-muted">No exams yet. <Link to="/teacher/exams/create">Create one!</Link></p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Course</th>
                <th>Questions</th>
                <th>Duration</th>
                <th>Scheduled</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {exams.map((exam) => (
                <tr key={exam._id}>
                  <td><strong>{exam.title}</strong></td>
                  <td>{exam.course?.name}</td>
                  <td>{exam.questions?.length}</td>
                  <td>{exam.duration} min</td>
                  <td>{new Date(exam.scheduledAt).toLocaleString()}</td>
                  <td>
                    <span className={`badge ${exam.published ? 'badge-green' : 'badge-yellow'}`}>
                      {exam.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className={`btn btn-sm ${exam.published ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => togglePublish(exam)}
                      >
                        {exam.published ? 'Unpublish' : 'Publish'}
                      </button>
                      <Link to={`/teacher/exams/${exam._id}/results`} className="btn btn-sm" style={{ background: '#eee' }}>
                        Results
                      </Link>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteExam(exam._id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
