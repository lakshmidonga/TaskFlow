# TaskFlow — Team Task Management System

**TaskFlow** is a modern, full-stack **MERN** (MongoDB, Express.js, React.js, Node.js) team task and sprint management system. It provides role-based access control (Admin vs Team Member), dynamic task boards, deadline & overdue tracking, live dashboard analytics, and RESTful APIs.

---

## 🌟 Key Features

1. **Authentication & Roles**:
   - Secure registration and login with bcrypt password hashing.
   - JWT-based authentication with expiration handling.
   - **Two Distinct Roles**:
     - 👑 **Admin**: Create, assign, edit, and delete any task; view organization metrics.
     - 👥 **Team Member**: View assigned tasks, update task progress, record progress remarks.
2. **Task Workflow & Lifecycle**:
   - **Statuses**: `To Do`, `In Progress`, `Completed`.
   - **Priorities**: `Low`, `Medium`, `High`.
   - **Deadline & Overdue Tracking**: Visual countdowns ("Due today", "3d left") and animated overdue alerts (`⚠️ Overdue by X days`).
   - **Progress History**: Timeline log tracking status changes and comments per task.
3. **Interactive Views**:
   - **Kanban Board**: Drag-free intuitive columns with status change actions.
   - **List / Table View**: Sortable rows with assignee avatars and quick details.
   - **Search & Multi-Filter**: Real-time search by title/keywords, filter by status, priority, assignee, and a 1-click **Overdue Only** toggle.
4. **Dashboard Analytics**:
   - Metric cards: Total Tasks, Pending (To Do), In Progress, Completed, Overdue.
   - Sprint progress meter with percentage completion.
   - Priority distribution bars (High, Medium, Low).
   - Upcoming deadlines widget with direct drill-down.
5. **Modern Design**:
   - Crafted with Vanilla CSS tokens, glassmorphism, responsive layouts, and Google Fonts (`Plus Jakarta Sans`).
   - 1-click demo login buttons for rapid evaluation.

---

## 📁 Project Structure

```
TaskFlow/
├── client/                     # Frontend (React + Vite)
│   ├── public/
│   ├── src/
│   │   ├── api/                # Universal API fetch client
│   │   ├── components/         # Navbar, TaskCard, TaskModal, FilterBar, StatCard, etc.
│   │   ├── context/            # AuthContext, ToastContext
│   │   ├── pages/              # Dashboard, TasksPage, TeamPage, Login, Register
│   │   ├── App.css             # Component & layout styling
│   │   ├── index.css           # Vanilla CSS design tokens & base utilities
│   │   ├── App.jsx             # Main application orchestrator
│   │   └── main.jsx            # React root mount
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js          # Proxies /api -> http://localhost:5000
│   └── package.json
│
├── server/                     # Backend (Node.js + Express + Mongoose)
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Me
│   │   ├── taskController.js   # CRUD, filtering, search, progress notes
│   │   ├── userController.js   # Team member list & workloads
│   │   └── dashboardController.js # Aggregated metrics & stats
│   ├── middleware/
│   │   ├── authMiddleware.js   # JWT verification & Admin authorization
│   │   └── errorMiddleware.js  # 404 & Centralized error handler
│   ├── models/
│   │   ├── User.js             # User schema with bcrypt hooks
│   │   └── Task.js             # Task schema with overdue virtuals
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── taskRoutes.js
│   │   ├── userRoutes.js
│   │   └── dashboardRoutes.js
│   ├── scripts/
│   │   └── seed.js             # Pre-populates demo accounts and tasks
│   ├── .env.example
│   ├── .env                    # Local environment variables
│   ├── server.js               # Express entrypoint
│   └── package.json
│
├── package.json                # Root scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher recommended; verified on Node v24)
- **MongoDB** (Local MongoDB Server or MongoDB Atlas cluster connection URI)

### 2. Backend Setup
1. Open a terminal in the `server` directory:
   ```bash
   cd server
   npm install
   ```
2. Configure `.env` (a default `.env` is created from `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://127.0.0.1:27017/taskflow
   JWT_SECRET=your_secret_key_here
   ADMIN_REGISTRATION_CODE=admin123
   ```
3. Seed the database with demo users and sample tasks:
   ```bash
   npm run seed
   ```
4. Start the backend server:
   ```bash
   npm run dev
   # Server runs at http://localhost:5000
   ```

### 3. Frontend Setup
1. In another terminal window:
   ```bash
   cd client
   npm install
   npm run dev
   # Vite dev server runs at http://127.0.0.1:5173
   ```
2. Open [http://127.0.0.1:5173](http://127.0.0.1:5173) in your browser.

---

## 🔑 Demo Credentials

You can use the **1-Click Fill** buttons on the login screen or enter these credentials manually:

| Name | Role | Email | Password | Department |
| :--- | :--- | :--- | :--- | :--- |
| **Alex Morgan** | `Admin` | `admin@taskflow.dev` | `admin123` | Product & Management |
| **Sarah Chen** | `Team Member` | `sarah@taskflow.dev` | `password123` | Frontend Engineering |
| **Marcus Vance** | `Team Member` | `marcus@taskflow.dev` | `password123` | Backend Architecture |
| **Elena Rostova** | `Team Member` | `elena@taskflow.dev` | `password123` | Cloud & Infrastructure |

> **Admin Registration**: When creating a new account with the `Admin` role on the register page, provide the Admin Registration Code: `admin123`.

---

## 📡 REST API Reference

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Register new user (Member or Admin) |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |
| `GET` | `/api/users` | Authenticated | List team members with active/completed task counts |
| `GET` | `/api/tasks` | Authenticated | List tasks (supports `search`, `status`, `priority`, `assignee`, `overdue`, `sort`) |
| `GET` | `/api/tasks/:id` | Authenticated | Get task by ID with progress history |
| `POST` | `/api/tasks` | **Admin Only** | Create a new task |
| `PUT` | `/api/tasks/:id` | Admin / Assignee | Update task details (Admin) or status/remarks (Assignee) |
| `DELETE`| `/api/tasks/:id` | **Admin Only** | Delete task |
| `POST` | `/api/tasks/:id/progress` | Admin / Assignee | Append progress note to task history |
| `GET` | `/api/dashboard/stats` | Authenticated | Aggregated metrics, completion rate, upcoming deadlines |
| `GET` | `/api/health` | Public | Server & MongoDB connection health check |

---

## 🛠️ MongoDB Troubleshooting

- **Local MongoDB**: If running MongoDB as a Windows service, ensure the `MongoDB` service is running (`Get-Service -Name MongoDB` in PowerShell).
- **MongoDB Atlas**: If using MongoDB Atlas in the cloud, copy your Atlas connection string into `server/.env`:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
  ```
- **Connection Check**: Test the backend health endpoint anytime at [http://localhost:5000/api/health](http://localhost:5000/api/health). It will return `database: "connected"`.
