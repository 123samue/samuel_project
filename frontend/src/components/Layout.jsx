import React from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = {
  student: [
    { to: '/student', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/student/attendance', label: 'My Attendance', icon: '📋' },
    { to: '/student/exams', label: 'Exams', icon: '📝' },
    { to: '/student/results', label: 'My Results', icon: '🏆' },
  ],
  teacher: [
    { to: '/teacher', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/teacher/attendance', label: 'Attendance', icon: '📋' },
    { to: '/teacher/exams', label: 'Manage Exams', icon: '📝' },
  ],
  admin: [
    { to: '/admin', label: 'Dashboard', icon: '🏠', end: true },
    { to: '/admin/users', label: 'Users', icon: '👥' },
    { to: '/admin/courses', label: 'Courses', icon: '📚' },
  ],
}

export default function Layout({ role }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-60 bg-slate-800 flex flex-col z-10">
        <div className="px-6 py-5 border-b border-slate-700">
          <span className="text-xl font-bold text-sky-400">🎓 EduOnline</span>
        </div>

        <nav className="flex-1 py-4">
          {navLinks[role]?.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors ${
                  isActive
                    ? 'bg-slate-700 text-white font-semibold'
                    : 'text-slate-400 hover:bg-slate-700 hover:text-white'
                }`
              }
            >
              <span>{link.icon}</span>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-slate-700">
          <p className="text-white text-sm font-semibold truncate">{user?.name}</p>
          <p className="text-slate-400 text-xs capitalize mb-3">{user?.role}</p>
          <button
            onClick={handleLogout}
            className="w-full text-sm bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 p-8">
        <Outlet />
      </main>
    </div>
  )
}
