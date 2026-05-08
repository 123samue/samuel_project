import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const fetchUsers = () => {
    api.get('/admin/users').then(({ data }) => setUsers(data)).finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [])

  const deleteUser = async (id) => {
    if (!window.confirm('Delete this user?')) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success('User deleted')
      fetchUsers()
    } catch {
      toast.error('Failed to delete user')
    }
  }

  const toggleActive = async (user) => {
    try {
      await api.patch(`/admin/users/${user._id}`, { active: !user.active })
      fetchUsers()
    } catch {
      toast.error('Failed to update user')
    }
  }

  const filtered = users.filter((u) => {
    const matchRole = filter === 'all' || u.role === filter
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <>
      <div className="topbar">
        <h1>👥 Manage Users</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            style={{ flex: 1, padding: '8px 14px', border: '1px solid #ddd', borderRadius: 8, minWidth: 200 }}
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            style={{ padding: '8px 14px', border: '1px solid #ddd', borderRadius: 8 }}
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? (
          <p className="text-muted">Loading...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-blue' : u.role === 'teacher' ? 'badge-yellow' : 'badge-green'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.active ? 'badge-green' : 'badge-red'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className={`btn btn-sm ${u.active ? 'btn-warning' : 'btn-success'}`}
                        onClick={() => toggleActive(u)}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u._id)}>
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
