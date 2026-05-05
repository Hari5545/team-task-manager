# 🗂️ TaskFlow — Team Task Manager

> A full-stack web application where teams can create projects, assign tasks, track progress, and manage members with **role-based access control (Admin / Member)**.

🌐 **Live Demo:** https://team-task-manager-frontend-pied.vercel.app  
📦 **Backend API:** https://team-task-manager-production-b190.up.railway.app  
📁 **GitHub Repo:** https://github.com/Hari5545/team-task-manager  
🎥 **Demo Video:**  https://drive.google.com/file/d/1J2b9XvkkNkVJZncXRMXiyloGWIjkBMW5/view?usp=sharing

---

## 🚀 Tech Stack

| Layer      | Technology                                 |
|------------|--------------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS, React Router |
| Backend    | Node.js, Express.js, REST API              |
| Database   | MongoDB, Mongoose ODM                      |
| Auth       | JWT (JSON Web Tokens), bcryptjs            |
| Deployment | Railway (Backend + DB), Vercel (Frontend)  |

---

## ✨ Key Features

### 🔐 Authentication
- User Signup & Login with JWT
- Passwords hashed with bcryptjs
- Protected routes on frontend & backend
- Token stored in localStorage with auto-expiry

### 👥 Role-Based Access Control

| Feature                    | Admin | Member |
|----------------------------|-------|--------|
| Create / delete projects   | ✅    | ❌     |
| Add / remove team members  | ✅    | ❌     |
| Create tasks               | ✅    | ✅     |
| Update any task            | ✅    | ❌     |
| Update own assigned tasks  | ✅    | ✅     |
| Delete tasks               | ✅    | ❌     |
| View dashboard & stats     | ✅    | ✅     |

### 📁 Project Management
- Create projects with name, description, color, due date
- Add team members to projects
- Track project status (Active / Completed / On Hold)
- Per-project task statistics

### ✅ Task Management
- Create tasks with title, description, priority, due date, tags
- Assign tasks to team members
- **Kanban Board** with 4 columns:
  - 📋 Todo → 🔄 In Progress → 👀 Review → ✅ Done
- Priority levels: Low / Medium / High / Urgent
- Automatic overdue detection

### 📊 Dashboard
- Total projects & active count
- Task completion percentage
- In-progress & overdue counts
- Progress bar visualization
- Recent tasks feed

---

## 📁 Project Structure

```
team-task-manager/
│
├── backend/                          # Node.js + Express API
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                 # MongoDB connection
│   │   ├── controllers/
│   │   │   ├── authController.js     # Signup, login, users
│   │   │   ├── projectController.js  # Project CRUD + stats
│   │   │   └── taskController.js     # Task CRUD + dashboard
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT protect + requireRole
│   │   ├── models/
│   │   │   ├── User.js               # User schema + bcrypt
│   │   │   ├── Project.js            # Project schema
│   │   │   └── Task.js               # Task schema + isOverdue
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # /api/auth/*
│   │   │   ├── projectRoutes.js      # /api/projects/*
│   │   │   └── taskRoutes.js         # /api/tasks/*
│   │   ├── utils/
│   │   │   └── seed.js               # Demo data seeder
│   │   └── server.js                 # Express app entry point
│   ├── .env.example
│   ├── package.json
│   └── railway.toml
│
├── frontend/                         # React + Vite + Tailwind
│   ├── src/
│   │   ├── api/
│   │   │   └── axios.js              # Axios + interceptors
│   │   ├── components/
│   │   │   └── layout/Layout.jsx     # Sidebar + navigation
│   │   ├── context/
│   │   │   └── AuthContext.jsx       # Global auth state
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── ProjectsPage.jsx
│   │   │   └── ProjectDetailPage.jsx # Kanban board
│   │   ├── App.jsx                   # Routes + guards
│   │   ├── main.jsx
│   │   └── index.css                 # Tailwind + styles
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local install or free MongoDB Atlas)
- npm

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/Hari5545/team-task-manager.git
cd team-task-manager
```

### 2️⃣ Setup Backend

```bash
cd backend
npm install
copy .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/taskflow
JWT_SECRET=your_super_secret_key_here
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

```bash
npm run dev
```

✅ Expected output:
```
🚀 Server running on port 5000 [development]
✅ MongoDB connected: localhost
```

### 3️⃣ Setup Frontend

Open a new terminal:
```bash
cd frontend
npm install
npm run dev
```

Open browser: **http://localhost:3000**

### 4️⃣ Seed Demo Data

```bash
cd backend
npm run seed
```

---

## 👤 Demo Credentials

| Role   | Email              | Password  |
|--------|--------------------|-----------|
| Admin  | admin@demo.com     | admin123  |
| Member | jordan@demo.com    | member123 |
| Member | sam@demo.com       | member123 |

---

## 🌐 REST API Reference

### Auth
| Method | Endpoint         | Access  | Description    |
|--------|------------------|---------|----------------|
| POST   | /api/auth/signup | Public  | Register user  |
| POST   | /api/auth/login  | Public  | Login + JWT    |
| GET    | /api/auth/me     | Private | Current user   |
| GET    | /api/auth/users  | Private | All users      |

### Projects
| Method | Endpoint          | Access | Description            |
|--------|-------------------|--------|------------------------|
| GET    | /api/projects     | Auth   | Get my projects        |
| GET    | /api/projects/:id | Auth   | Get single project     |
| POST   | /api/projects     | Admin  | Create project         |
| PUT    | /api/projects/:id | Admin  | Update project         |
| DELETE | /api/projects/:id | Admin  | Delete project + tasks |

### Tasks
| Method | Endpoint                | Access | Description       |
|--------|-------------------------|--------|-------------------|
| GET    | /api/projects/:id/tasks | Auth   | Get project tasks |
| POST   | /api/projects/:id/tasks | Auth   | Create task       |
| PUT    | /api/tasks/:id          | Auth   | Update task       |
| DELETE | /api/tasks/:id          | Auth   | Delete task       |
| GET    | /api/tasks/dashboard    | Auth   | Dashboard stats   |

---

## 🚀 Deployment

### Backend → Railway
- Platform: [railway.app](https://railway.app)
- Root Directory: `backend`
- Live URL: https://team-task-manager-production-b190.up.railway.app

Environment Variables set on Railway:
```
MONGODB_URI = <Railway MongoDB URL>
JWT_SECRET  = taskflow_super_secret_key_2024
CLIENT_URL  = https://team-task-manager-frontend-pied.vercel.app
NODE_ENV    = production
PORT        = 5000
```

### Frontend → Vercel
- Platform: [vercel.com](https://vercel.com)
- Root Directory: `frontend`
- Live URL: https://team-task-manager-frontend-pied.vercel.app

Environment Variable set on Vercel:
```
VITE_API_URL = https://team-task-manager-production-b190.up.railway.app/api
```

---

## ✅ Assignment Checklist

- [x] Authentication — Signup & Login with JWT
- [x] Role-Based Access Control — Admin & Member
- [x] Project & Team Management
- [x] Task Creation, Assignment & Status Tracking
- [x] Dashboard — tasks, status, overdue stats
- [x] REST APIs with proper validation
- [x] MongoDB with relationships (User → Project → Task)
- [x] Kanban Board (Todo → In Progress → Review → Done)
- [x] Deployed on Railway (Backend) + Vercel (Frontend)
- [x] GitHub Repository
- [x] README Documentation
- [x] Demo Video

---

## 👨‍💻 Author

**Hariom Chauhan**  
GitHub: [@Hari5545](https://github.com/Hari5545)  
Live App: [team-task-manager-frontend-pied.vercel.app](https://team-task-manager-frontend-pied.vercel.app)
