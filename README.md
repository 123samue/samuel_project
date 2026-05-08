# 🎓 EduOnline — Online School Platform

A full-stack online school platform with attendance tracking and online examinations.

## Tech Stack

- **Frontend**: React 18 + Vite 4, React Router v6, Axios, React Toastify
- **Backend**: Node.js, Express, MongoDB (Mongoose), JWT Auth

## Features

### 👨‍🎓 Students
- Dashboard with stats (attendance rate, exam scores, upcoming exams)
- View personal attendance records with summary
- Take timed online exams with auto-submit
- View results with detailed answer review

### 👩‍🏫 Teachers
- Dashboard with class statistics
- Mark attendance per course per day (present/absent/late)
- View attendance history with rates
- Create exams with multiple-choice questions
- Publish/unpublish exams
- View all student results per exam

### 🔧 Admins
- Platform-wide statistics
- Manage all users (activate/deactivate/delete)
- Create and manage courses, assign teachers

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### Backend Setup

```bash
cd backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run seed      # Seed demo data
npm run dev       # Start backend on port 5000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev       # Start frontend on port 5173
```

Open http://localhost:5173

## Demo Accounts

| Role    | Email                  | Password    |
|---------|------------------------|-------------|
| Admin   | admin@school.edu       | admin123    |
| Teacher | sarah@school.edu       | teacher123  |
| Student | alice@school.edu       | student123  |

## Project Structure

```
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance
│   │   ├── context/      # Auth context
│   │   ├── components/   # Layout, Sidebar
│   │   └── pages/
│   │       ├── auth/     # Login, Register
│   │       ├── student/  # Dashboard, Attendance, Exams, Results
│   │       ├── teacher/  # Dashboard, Attendance, Exams, CreateExam
│   │       └── admin/    # Dashboard, Users, Courses
│   └── vite.config.js
└── backend/
    ├── models/           # User, Course, Attendance, Exam, ExamResult
    ├── routes/           # auth, courses, attendance, exams, students, teachers, admin
    ├── middleware/       # JWT auth + role authorization
    ├── seed.js           # Demo data seeder
    └── server.js
```
