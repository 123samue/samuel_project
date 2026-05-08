import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { AuthProvider, useAuth } from './context/AuthContext'

// Auth pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'

// Shared layout
import Layout from './components/Layout'

// Student pages
import StudentDashboard from './pages/student/Dashboard'
import StudentAttendance from './pages/student/Attendance'
import StudentExams from './pages/student/Exams'
import TakeExam from './pages/student/TakeExam'
import StudentResults from './pages/student/Results'

// Teacher pages
import TeacherDashboard from './pages/teacher/Dashboard'
import ManageAttendance from './pages/teacher/ManageAttendance'
import ManageExams from './pages/teacher/ManageExams'
import CreateExam from './pages/teacher/CreateExam'
import ExamResults from './pages/teacher/ExamResults'

// Admin pages
import AdminDashboard from './pages/admin/Dashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageCourses from './pages/admin/ManageCourses'

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ padding: 40 }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />
  return children
}

function RoleRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  if (user.role === 'admin') return <Navigate to="/admin" replace />
  if (user.role === 'teacher') return <Navigate to="/teacher" replace />
  return <Navigate to="/student" replace />
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastContainer position="top-right" autoClose={3000} />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<RoleRedirect />} />

          {/* Student */}
          <Route path="/student" element={
            <ProtectedRoute roles={['student']}>
              <Layout role="student" />
            </ProtectedRoute>
          }>
            <Route index element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="exams/:id/take" element={<TakeExam />} />
            <Route path="results" element={<StudentResults />} />
          </Route>

          {/* Teacher */}
          <Route path="/teacher" element={
            <ProtectedRoute roles={['teacher']}>
              <Layout role="teacher" />
            </ProtectedRoute>
          }>
            <Route index element={<TeacherDashboard />} />
            <Route path="attendance" element={<ManageAttendance />} />
            <Route path="exams" element={<ManageExams />} />
            <Route path="exams/create" element={<CreateExam />} />
            <Route path="exams/:id/results" element={<ExamResults />} />
          </Route>

          {/* Admin */}
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}>
              <Layout role="admin" />
            </ProtectedRoute>
          }>
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="courses" element={<ManageCourses />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
