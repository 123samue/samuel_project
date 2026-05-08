import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import api from '../../api/axios'

const roleBadge = {
  admin:   'bg-violet-100 text-violet-700',
  teacher: 'bg-amber-100 text-amber-700',
  student: 'bg-sky-100 text-sky-700',
}

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
    try { await api.delete(`/admin/users/${id}`); toast.success('Deleted'); fetchUsers() }
    catch { toast.error('Failed to delete') }
  }

  const toggleActive = async (user) => {
    try { await api.patch(`/admin/users/${user._id}`, { active: !user.active }); fetchUsers() }
    catch { toast.error('Failed to update') }
  }

  const filtered = users.filter((u) => {
    const matchRole = filter === 'all' || u.role === filter
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    return matchRole && matchSearch
  })

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">👥 Manage Users</h1>
          <p className="text-slate-500 text-sm mt-1">{users.length} total users</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <input
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-48 px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
          </select>
        </div>

        {loading ? (
          <p className="text-slate-400 text-sm">Loading...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {['Name', 'Email', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                    <th key={h} className="text-left py-3 px-4 text-slate-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-700">{u.name}</td>
                    <td className="py-3 px-4 text-slate-500">{u.email}</td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${roleBadge[u.role]}`}>{u.role}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${u.active ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {u.active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => toggleActive(u)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${u.active ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}`}>
                          {u.active ? 'Deactivate' : 'Activate'}
                        </button>
                        <button onClick={() => deleteUser(u._id)} className="text-xs bg-red-100 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-200 transition-colors">
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
