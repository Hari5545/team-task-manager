# 🗂️ TaskFlow — Team Task Manager

A full-stack web application for managing team projects and tasks with role-based access control.

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, Tailwind CSS        |
| Backend    | Node.js, Express.js                 |
| Database   | MongoDB (Mongoose ODM)              |
| Auth       | JWT (JSON Web Tokens)               |
| Deployment | Railway (backend + DB), Vercel (frontend) |

---

## 📁 Project Structure

```
team-task-manager/
├── backend/
│   ├── src/
│   │   ├── config/       # Database connection
│   │   ├── controllers/  # Business logic (auth, projects, tasks)
│   │   ├── middleware/   # JWT auth + role guard
│   │   ├── models/       # Mongoose schemas (User, Project, Task)
│   │   ├── routes/       # Express route definitions
│   │   ├── utils/        # Seed script
│   │   └── server.js     # Entry point
│   ├── .env.example
│   ├── package.json
│   └── railway.toml
│
├── frontend/
│   ├── src/
│   │   ├── api/          # Axios instance with interceptors
│   │   ├── components/
│   │   │   └── layout/   # Sidebar + Layout wrapper
│   │   ├── context/      # AuthContext (global auth state)
│   │   ├── pages/        # Login, Signup, Dashboard, Projects, ProjectDetail
│   │   ├── App.jsx       # Router + route guards
│   │   ├── main.jsx
│   │   └── index.css     # Tailwind + custom components
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚡ Local Setup (Step-by-Step)

### Prerequisites
- Node.js v18+
- MongoDB installed locally **OR** a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
- npm or yarn

---

### 1️⃣ Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend (separate terminal)
cd frontend
npm install
```

---

### 2️⃣ Configure Backend Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/team-task-manager
JWT_SECRET=your_very_long_random_secret_here_change_this
PORT=5000
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

---

### 3️⃣ (Optional) Seed Demo Data

```bash
cd backend
npm run seed
```

This creates:
- **Admin:** `admin@demo.com` / `admin123`
- **Member:** `jordan@demo.com` / `member123`
- **Member:** `sam@demo.com` / `member123`
- 2 sample projects + 7 tasks

---

### 4️⃣ Start the Servers

```bash
# Terminal 1 — Backend
cd backend
npm run dev        # Starts on http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm run dev        # Starts on http://localhost:3000
```

Open **http://localhost:3000** in your browser.

---

## 🔑 Role-Based Access Control

| Feature                      | Admin | Member |
|------------------------------|-------|--------|
| Create/delete projects       | ✅    | ❌     |
| Add/remove team members      | ✅    | ❌     |
| Create tasks                 | ✅    | ✅     |
| Update any task              | ✅    | ❌     |
| Update own assigned tasks    | ✅    | ✅     |
| Delete tasks                 | ✅    | ❌*    |
| View dashboard stats         | ✅    | ✅     |

*Members can delete tasks they created.

---

## 🌐 REST API Reference

### Auth
| Method | Endpoint           | Access  | Description         |
|--------|--------------------|---------|---------------------|
| POST   | /api/auth/signup   | Public  | Register user       |
| POST   | /api/auth/login    | Public  | Login + get JWT     |
| GET    | /api/auth/me       | Private | Get current user    |
| GET    | /api/auth/users    | Private | List all users      |

### Projects
| Method | Endpoint            | Access | Description              |
|--------|---------------------|--------|--------------------------|
| GET    | /api/projects       | Auth   | List my projects         |
| GET    | /api/projects/:id   | Auth   | Get single project       |
| POST   | /api/projects       | Admin  | Create project           |
| PUT    | /api/projects/:id   | Admin  | Update project           |
| DELETE | /api/projects/:id   | Admin  | Delete project + tasks   |

### Tasks
| Method | Endpoint                          | Access | Description           |
|--------|-----------------------------------|--------|-----------------------|
| GET    | /api/projects/:id/tasks           | Auth   | Get project tasks     |
| POST   | /api/projects/:id/tasks           | Auth   | Create task           |
| PUT    | /api/tasks/:id                    | Auth   | Update task           |
| DELETE | /api/tasks/:id                    | Auth   | Delete task           |
| GET    | /api/tasks/dashboard              | Auth   | Dashboard stats       |

---

## 🚀 Deploying to Railway

### Backend

1. Push your code to GitHub
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Select the `backend` folder (or set root directory)
4. Add a **MongoDB** plugin from Railway dashboard
5. Set environment variables:
   ```
   MONGODB_URI   = <Railway MongoDB URL>
   JWT_SECRET    = <your secret>
   CLIENT_URL    = <your Vercel frontend URL>
   NODE_ENV      = production
   ```
6. Railway auto-deploys on push ✅

### Frontend

1. Push frontend to GitHub
2. Deploy on [Vercel](https://vercel.com) → Import project → set root to `frontend`
3. Set environment variable:
   ```
   VITE_API_URL = https://your-backend.up.railway.app/api
   ```
4. Deploy ✅

---

## 🧪 Testing the API

Use the included health check:
```bash
curl http://localhost:5000/api/health
```

---

## 📋 Submission Checklist

- [x] Authentication (Signup/Login with JWT)
- [x] Role-based access (Admin/Member)
- [x] Project & team management
- [x] Task creation, assignment & status tracking
- [x] Dashboard with stats (total, in-progress, overdue)
- [x] REST APIs with validation
- [x] MongoDB with proper relationships
- [x] Kanban board (Todo → In Progress → Review → Done)
- [x] Deploy-ready (Railway + Vercel)

---

## 👤 Demo Credentials

After running `npm run seed`:

| Role   | Email              | Password   |
|--------|--------------------|------------|
| Admin  | admin@demo.com     | admin123   |
| Member | jordan@demo.com    | member123  |
| Member | sam@demo.com       | member123  |
