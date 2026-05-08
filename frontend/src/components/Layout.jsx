import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const navLinks = {
  student: [
    { to: '/student', label: '🏠 Dashboard', end: true },
    { to: '/student/attendance', label: '📋 My Attendance' },
    { to: '/student/exams', label: '📝 Exams' },
    { to: '/student/results', label: '🏆 My Results' },
  ],
  teacher: [
    { to: '/teacher', label: '🏠 Dashboard', end: true },
    { to: '/teacher/attendance', label: '📋 Attendance' },
    { to: '/teacher/exams', label: '📝 Manage Exams' },
  ],
  admin: [
    { to: '/admin', label: '🏠 Dashboard', end: true },
    { to: '/admin/users', label: '👥 Users' },
    { to: '/admin/courses', label: '📚 Courses' },
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
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">🎓 EduOnline</div>
        <nav>
          {navLinks[role]?.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) => isActive ? 'active' : ''}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ marginBottom: 8 }}>
            <strong>{user?.name}</strong>
            <br />
            <span style={{ textTransform: 'capitalize' }}>{user?.role}</span>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              color: '#fff',
              padding: '6px 14px',
              borderRadius: 6,
              cursor: 'pointer',
              fontSize: '0.85rem',
            }}
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
