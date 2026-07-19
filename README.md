# La Traino — A Personalized Physical Training System

A web-based platform connecting personal trainers and trainees for structured workout and diet management. Built as a BSc CSIT final year project.

---

## Features

### ADMIN
- User management — view, search, enable/disable accounts
- Global workout preset library — create, edit, delete
- Global diet preset library — create, edit, delete
- System dashboard with usage statistics

### TRAINER
- Create workout templates with drag-and-drop exercise builder
- Create diet templates with per-meal food planning
- Import from global library into personal templates
- Assign workouts to individual trainees or bulk assign
- Assign diet plans to trainees
- Weekly calendar view with per-day workout/diet overview
- Coaching hub — feedback, exercise comments, diet comments
- Progress analytics and trainee workout history
- Trainee management — link, unlink, view logs

### TRAINEE
- Link to a trainer using a 6-character code
- Unlink from trainer (clears assignments, preserves history)
- Track daily workouts with per-set progress (sets, reps, weight)
- Track daily diet with per-meal completion
- Weekly progress chart with completion rate
- Calendar view of scheduled workouts and diet plans
- Trainer feedback and coaching comments
- Browse and select preset workout programs (independent mode)
- Exercise performance history with personal bests and progression charts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, React Router 7, Tailwind CSS 4 |
| Backend | Node.js, Express 5, Prisma 7 |
| Database | PostgreSQL (Neon) |
| Auth | JWT (jsonwebtoken + bcryptjs), Google OAuth (google-auth-library) |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

---

## System Architecture

```
+---------------------+       +------------------------+       +--------------+
|   React SPA (Vite)  | ----> |   Express REST API     | ----> |  PostgreSQL  |
|   Tailwind CSS      |  HTTP |   Prisma ORM           |  SQL  |  (Neon)      |
|   React Router      | <---- |   JWT / OAuth          | <---- |              |
+---------------------+       +------------------------+       +--------------+
         |                              |
    Vercel deploy                  Render deploy
```

The frontend is a single-page application that communicates with the backend over HTTP. The backend is a stateless REST API. Authentication uses JWT tokens (24h expiry) with optional Google OAuth. Database access is exclusively through Prisma ORM.

---

## Installation

### Prerequisites

- Node.js 20+
- PostgreSQL (local or Neon)
- npm

### Backend

```bash
cd server
npm install
cp .env.example .env    # edit with your credentials
npx prisma migrate deploy
npm run seed
npm run dev
```

The API server starts on `http://localhost:5000`.

### Frontend

```bash
cd client
npm install
cp .env.example .env    # edit with your credentials
npm run dev
```

The dev server starts on `http://localhost:5173`.

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID |
| `FRONTEND_URL` | Yes | Frontend origin (for CORS) |
| `PORT` | No | Server port (default: 5000) |

### Frontend (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID (same as backend) |

---

## Demo Accounts

After running `npm run seed`, the following accounts are available:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| ADMIN | `admin@latraino.com` | `admin123` | Full system access |
| ADMIN | `admin@latraino.demo` | `Password123` | Fallback admin |
| TRAINER | `trainer@latraino.demo` | `Password123` | Rich demo data — 2 linked trainees, coaching notes, comments |
| TRAINER | `sarah.jenkins@example.com` | `password123` | Code: TRNR01 — 3 linked trainees |
| TRAINER | `marcus.chen@example.com` | `password123` | Code: TRNR02 — 3 linked trainees |
| TRAINEE | `trainee1@latraino.demo` | `Password123` | Linked to Alex Trainer — 10-week exercise history |
| TRAINEE | `trainee2@latraino.demo` | `Password123` | Linked to Alex Trainer — full demo data |
| TRAINEE | `emily.r@example.com` | `password123` | Linked to Sarah Jenkins |
| TRAINEE | `james.t@example.com` | `password123` | Linked to Sarah Jenkins |
| TRAINEE | `sophia.k@example.com` | `password123` | Linked to Sarah Jenkins |

---

## Demo Flow

### Trainer Walkthrough

1. Login as `trainer@latraino.demo` / `Password123`
2. **Dashboard** — view linked trainees, recent activity, quick stats
3. Click a trainee → **Assign Workout** — build a workout with drag-and-drop exercises
4. Click a trainee → **Assign Diet** — custom diet or use a template
5. **Calendar** — view workout/diet assignments across the week
6. **Coaching Hub** — send feedback, view timeline, add comments
7. **Workout Templates** — create reusable templates, import from global library
8. **History** — browse past assignments, edit, duplicate

### Trainee Walkthrough

1. Login as `trainee1@latraino.demo` / `Password123`
2. **Dashboard** — today's workout, diet plan, weekly progress, feedback
3. **Workouts** — track sets, reps, weight with real-time autosave
4. **Diet** — mark meals as complete, view nutrition details
5. **Progress** — weekly completion chart, trainer feedback
6. **Calendar** — view scheduled workouts and diet plans
7. **Exercise History** — per-exercise progression chart, personal bests

### Admin Walkthrough

1. Login as `admin@latraino.com` / `admin123`
2. **Dashboard** — system statistics (users, trainers, trainees)
3. **Users** — view, search, enable/disable accounts
4. **Global Library** — create/edit workout and diet templates for trainers to import

---

## Screenshots

| Page | Preview |
|------|---------|
| Landing Page | `![Landing](screenshots/landing.png)` |
| Trainer Dashboard | `![Trainer Dashboard](screenshots/trainer-dashboard.png)` |
| Trainee Dashboard | `![Trainee Dashboard](screenshots/trainee-dashboard.png)` |
| Admin Dashboard | `![Admin Dashboard](screenshots/admin-dashboard.png)` |
| Calendar View | `![Calendar](screenshots/calendar.png)` |
| Coaching Hub | `![Coaching Hub](screenshots/coaching-hub.png)` |
| Workout Builder | `![Workout Builder](screenshots/workout-builder.png)` |
| Progress Chart | `![Progress](screenshots/progress.png)` |

---

## Project Structure

```
La Traino/
├── client/                    # React frontend
│   ├── src/
│   │   ├── api/               # API client functions
│   │   ├── components/        # Reusable UI components
│   │   ├── context/           # React context providers
│   │   ├── pages/             # Route page components
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── trainer/       # Trainer pages
│   │   │   └── trainee/       # Trainee pages
│   │   ├── App.jsx            # Router configuration
│   │   └── main.jsx           # Entry point
│   └── ...
├── server/                    # Express backend
│   ├── prisma/                # Schema, migrations, seeds
│   ├── src/
│   │   ├── config/            # Prisma client config
│   │   ├── controllers/       # Route handlers
│   │   ├── middleware/        # Auth middleware (protect, restrictTo)
│   │   ├── routes/            # Express route definitions
│   │   ├── services/          # Business logic layer
│   │   └── utils/             # Shared utilities
│   └── ...
├── docs/                      # Project documentation
│   ├── PROJECT_SPEC.md        # Project specification
│   ├── AUTH_DESIGN.md         # Authentication design
│   ├── SUBMISSION_GUIDE.md    # Viva preparation guide
│   └── SESSION_SUMMARY.md     # Development session log
├── SDD.md                     # Software design document
└── README.md                  # This file
```

---

## Documentation

| Document | Description |
|----------|-------------|
| `SDD.md` | Software Design Document — architecture, schema, endpoints, milestones |
| `docs/PROJECT_SPEC.md` | Project specification — features, roles, entities, deployment |
| `docs/AUTH_DESIGN.md` | Authentication design — JWT, OAuth, route protection, security |
| `docs/SUBMISSION_GUIDE.md` | Viva preparation — setup, demo accounts, talking points, limitations |
| `client/README.md` | Frontend setup and deployment guide |
| `server/README.md` | Backend setup and deployment guide |

---

## Future Enhancements

- Real-time notifications (WebSocket)
- Mobile application (React Native)
- AI-powered workout and diet recommendations
- Wearable device integration (heart rate, sleep data)
- Payment gateway for trainer subscriptions
- Dark mode (persisted in user preferences)
- Meal scanning and nutritional auto-calculation
- Group training sessions and class scheduling

---

## Authors

**Department of Statistics and Computer Science**  
Patan Multiple Campus, Tribhuvan University

| Name | Student ID |
|------|-----------|
| Laxman Paudel | 79010051 |
| Bijaya Paudel | 79010023 |
| Roshan Poudel | 79010096 |

---

*Built with React, Node.js, and PostgreSQL. Submitted as a partial fulfillment of the B.Sc. CSIT degree.*
