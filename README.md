# Learniee — Parent Dashboard with Course Search

A full-stack app for parents to sign up, log in, and search/filter/book courses for their
child. Built with **React (Vite) + Tailwind CSS** on the frontend and **Node.js (Express) +
MongoDB (Mongoose)** on the backend, with JWT-based auth.

## What was built

**Auth**
- Real signup/login with hashed passwords (bcrypt) and JWT issued on success.
- Token stored in `localStorage`; an `/api/auth/me` check on app load restores the session
  on refresh ("stay logged in"), and `/dashboard` is a protected route that redirects to
  `/login` if there's no valid session.

**Parent Dashboard**
- A report-card-styled header showing the logged-in parent's name, email, and their child's
  name/grade, styled with a distinct visual identity (Fraunces display type, Inter body,
  JetBrains Mono for data, a navy/sage/amber palette) rather than a generic template.
- Leads directly into the course search section.

**Course Search**
- Free-text search (debounced) across course name/subject via a MongoDB text index.
- Combinable filters: grade, subject, price range, minimum teacher rating.
- Sorting: newest, price (low→high / high→low), teacher rating.
- "Load more" pagination once results exceed the page size (9 per page).
- A designed empty state ("No courses match yet") with a one-click filter reset, and a
  loading skeleton state instead of a blank screen.

## Where data is stored

MongoDB, via two collections:

**`users`**
```json
{
  "_id": "66c1f2a1b8e4a90012ab34cd",
  "name": "Priya Mehta",
  "email": "priya@example.com",
  "password": "$2a$10$hashed...",
  "childName": "Aarav",
  "childGrade": "Grade 5",
  "createdAt": "2026-08-10T09:12:00.000Z"
}
```

**`courses`**
```json
{
  "_id": "66c1f2b3b8e4a90012ab34ef",
  "name": "Algebra Foundations",
  "subject": "Mathematics",
  "grade": "Grade 3-5",
  "teacher": "Ms. Sharma",
  "teacherRating": 4.6,
  "price": 2499,
  "description": "A hands-on mathematics course designed to build strong fundamentals...",
  "createdAt": "2026-08-01T10:00:00.000Z"
}
```

Run `npm run seed` in `backend/` to populate `courses` with 60 sample rows.

## Running it locally

```bash
# 1. MongoDB running locally (or an Atlas connection string)

# 2. Backend
cd backend
cp .env.example .env      # fill in MONGO_URI and JWT_SECRET
npm install
npm run seed               # optional: adds sample courses
npm run dev                 # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

The frontend dev server proxies `/api` to `http://localhost:5000`, so no CORS setup is
needed locally.

## Assumptions made (per the brief's "make a reasonable assumption" rule)

- "Book course" is a UI affordance on each course card; there's no booking/payment flow or
  booking-status table, since the brief scopes the deliverable to search + a working auth
  flow, not checkout.
- Child name/grade are optional signup fields shown on the dashboard, used only as
  read-only profile context — they don't auto-filter course results, since the brief didn't
  specify that behavior and doing it silently could hide results a parent expects to see.
- Course `grade` and `subject` are free-text-but-constrained fields seeded from a fixed list
  and exposed via `/api/courses/meta` so filter dropdowns always match what's actually in
  the database, rather than a hardcoded frontend list that can drift from the data.

## Scaling to 1M concurrent users

The brief's own scale is a local JSON/SQLite prototype; the version above already swaps
that for MongoDB with indexes and a stateless API. Getting from "a MongoDB-backed API" to
"holds up under ~1M concurrent users" is an infrastructure and architecture question more
than a code change, and it's not something that can be genuinely validated by generating
code, since it requires real load testing against real infrastructure. What's in this repo,
and what a production rollout would add on top:

**Already in this codebase**
- Stateless JWT auth — no server-side session store, so any number of API replicas can
  handle any request without sharing state.
- Indexes on every field used for filtering/sorting (`subject`, `grade`, `price`,
  `teacherRating`, plus a text index for search) so queries stay fast as the `courses`
  collection grows, instead of falling back to collection scans.
- `.lean()` reads on the hot search endpoint (skips Mongoose document hydration), gzip
  compression, and a capped page size (max 50) so no single request can return an
  unbounded payload.
- Per-IP rate limiting (tighter on auth) and Helmet security headers.

**What real 1M-concurrent scale requires beyond this repo**
1. **Horizontal scaling of the API** — run the Express app as many stateless replicas
   (containers/pods) behind a load balancer (e.g. Nginx, AWS ALB) with auto-scaling on
   CPU/connection count, rather than one Node process.
2. **MongoDB as a replica set or sharded cluster** (e.g. MongoDB Atlas), not a single
   instance — reads spread across secondaries, writes on the primary, and sharding by a
   key like `subject` or region if the `courses` collection grows very large.
3. **A caching layer (Redis)** in front of hot, mostly-static reads — course search results
   for common filter combinations, and the `/courses/meta` dropdown data — so most traffic
   never touches MongoDB at all.
4. **Rate limiting and session data backed by Redis**, not per-process memory, so limits
   are enforced consistently across every API replica.
5. **CDN for the frontend** — the built Vite bundle and static assets served from a CDN
   edge, not the API server, so 1M users hitting the dashboard don't compete with 1M users
   hitting the search API.
6. **Connection pool tuning and query auditing** under real load — `maxPoolSize` here is a
   reasonable default, but the right number depends on measured concurrency per replica,
   found through actual load testing (e.g. k6, Artillery) against a staging cluster.
7. **Async workloads off the request path** — e.g. sending confirmation emails, analytics
   events on a queue (SQS/RabbitMQ) instead of inline in the request/response cycle.

## What I'd improve with more time

- A real booking flow: a `bookings` collection linking a parent, child, and course, with a
  booking-status view on the dashboard.
- Server-side validation with a schema library (e.g. Zod/Joi) instead of manual checks in
  the controllers.
- Automated tests: API tests for auth and search (Jest/Supertest), component tests for the
  filter/search UI (React Testing Library).
- Refresh tokens instead of a single long-lived JWT, for better session security.
- Saved searches / favorited courses per parent.
# learneee
