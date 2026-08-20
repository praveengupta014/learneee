# Learniee — Parent Dashboard & Course Discovery Platform

A full-stack application for parents to discover, filter, and book interactive live courses for their children. Built with **React (Vite) + Tailwind CSS** on the frontend and **Node.js (Express) + MongoDB (Mongoose)** on the backend, featuring JWT authentication and fully configured for **Vercel Serverless Deployment**.

---

## 🚀 Features & What was Built

### 1. 🔐 Authentication & Session Persistence
- **Secure Signup & Login**: Passwords hashed with `bcrypt`, JWT token generation with expiration.
- **Session Persistence ("Stay Logged In")**: Token stored in `localStorage`; `/api/auth/me` verifies identity on refresh.
- **Parent & Child Profile Editing**: Edit parent name, child name, and grade directly from the dashboard header (`PUT /api/auth/profile`).
- **Protected Routes**: Redirects unauthenticated requests to `/login`.

### 2. 📊 Parent Dashboard
- **Report-Card Identity**: Real-time overview of current date, enrolled course count, and child details.
- **"My Bookings" Modal Drawer**: View active enrollments, instructor names, chosen schedules/slots, and cancel enrollments if needed (`GET /api/courses/my-bookings`, `DELETE /api/courses/bookings/:id`).
- **Toast Notifications**: Interactive toast alerts for logins, profile changes, bookings, and errors.

### 3. 🔍 Course Search & Discovery
- **Debounced Smart Search**: Safe case-insensitive regex search across course titles, subjects, instructors, and descriptions without requiring pre-indexed full-text collections.
- **Quick Subject Filter Pills**: Instant one-click filtering (Mathematics, Coding, Science, English, Art, Music).
- **Multi-parameter Filtering**: Grade, Subject, Price Range (min/max), and Minimum Teacher Rating.
- **Sorting**: Newest, Price (Low → High / High → Low), Teacher Rating.
- **Pagination**: "Load more" button with loading state.
- **Instant Data Seeding**: If the database is clean/empty, parents or reviewers can click **"⚡ Populate Sample Courses"** or hit `POST /api/courses/seed` to seed 40+ rich sample courses immediately.

### 4. 📖 Course Details & Booking
- **Course Detail Modal**: In-depth syllabus breakdown, weekly topics, teacher qualifications, schedule slots, and course highlights.
- **Interactive Booking Flow**: Modal enrollment form with child name/grade confirmation, slot selection, and special learning notes.

---

## 🌐 Deploying to Vercel (Step-by-Step)

The repository is configured for single-click deployment on Vercel:

### Step 1: Configure MongoDB Atlas (Important!)
1. Open your [MongoDB Atlas Dashboard](https://cloud.mongodb.com/).
2. Under **Security** → **Network Access**, ensure you have an entry for `0.0.0.0/0` (Allow access from anywhere).
   > **Why?** Vercel Serverless Functions use dynamic IP addresses. Without `0.0.0.0/0`, MongoDB Atlas will block requests.
3. Under **Database**, click **Connect** → **Drivers** to copy your MongoDB Connection String:
   `mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/learniee?retryWrites=true&w=majority`

### Step 2: Deploy to Vercel
1. Go to [Vercel](https://vercel.com/) and click **Add New...** → **Project**.
2. Import this repository (`learniee-2` / `learneee`).
3. Set the **Environment Variables** in the Vercel deployment screen:
   - `MONGO_URI`: Your MongoDB Atlas connection string
   - `JWT_SECRET`: A secure random string (e.g. `learniee_super_secret_jwt_key_2026`)
   - `NODE_ENV`: `production`
4. Click **Deploy**. Vercel will build the frontend and deploy the serverless backend functions automatically.

### Step 3: Populate Sample Courses
Once deployed, log into your new app, and click **"⚡ Populate Sample Courses"** on the dashboard, or trigger `POST https://your-app.vercel.app/api/courses/seed`.

---

## 💻 Running Locally

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas connection string (or local MongoDB on `mongodb://127.0.0.1:27017/learniee`)

### Setup Commands
```bash
# 1. Clone repo and configure environment
cd backend
cp .env.example .env
# Edit backend/.env and paste your MONGO_URI and JWT_SECRET

# 2. Seed initial courses (optional)
npm install
npm run seed

# 3. Start Backend server (port 5000)
npm run dev

# 4. Start Frontend server in a new terminal (port 5173)
cd ../frontend
npm install
npm run dev
```

Visit `http://localhost:5173` to explore the application.

---

## 📁 Project Architecture

```
learniee/
├── vercel.json                 # Root Vercel unified deployment config
├── package.json                # Root build & dev scripts
├── api/
│   └── index.js                # Vercel Serverless Functions entrypoint
├── backend/
│   ├── config/db.js            # Cached Mongoose connection for serverless
│   ├── controllers/            # Auth, course, and booking controllers
│   ├── middleware/             # JWT auth & error handling middleware
│   ├── models/                 # User, Course, and Booking schemas
│   ├── routes/                 # Express API routes (/api/auth, /api/courses)
│   ├── seed/seed.js            # Sample course generation script
│   ├── server.js               # Local & standalone Node server
│   ├── app.js                  # Configured Express application instance
│   └── vercel.json             # Backend-only deployment config
└── frontend/
    ├── src/
    │   ├── api/axios.js        # Configured Axios with dynamic baseURL & 401 interceptor
    │   ├── components/         # Modals, Navbar, Cards, Filters, Toast
    │   ├── context/            # AuthContext (Auth, Profile, Toasts)
    │   ├── pages/              # Dashboard, Login, Signup
    │   └── main.jsx            # React root
    ├── tailwind.config.js      # Custom theme colors (Fraunces, Inter, JetBrains Mono)
    ├── vite.config.js          # Vite build & local proxy
    └── vercel.json             # Frontend-only deployment config
```

---

## 🔒 Security & Performance Features
- **Stateless Horizontal Scaling**: JWT-based session verification with no server-side sticky sessions.
- **Connection Caching**: `cached.conn` prevents connection pool exhaustion across serverless cold/warm starts.
- **Helmet Security Headers & CORS**: Cross-origin protection and preflight request management.
- **Database Graceful Degradation**: 503 error feedback with recovery guidance if Atlas connection drops.
- **Lean Mongoose Queries**: `.lean()` avoids document hydration overhead on hot endpoints.

