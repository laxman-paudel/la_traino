# La Traino — Submission Guide

**Project:** La Traino — A Personalized Physical Training System  
**Team:** Laxman Paudel (79010051), Bijaya Paudel (79010023), Roshan Poudel (79010096)  
**Institution:** Department of Statistics and Computer Science, Patan Multiple Campus, Tribhuvan University  
**Program:** B.Sc. CSIT

---

## 1. Project Overview

La Traino is a web-based platform that connects personal trainers with trainees for structured workout and diet management. It supports two modes:

- **Self-guided** — trainees browse and follow preset workout programs independently.
- **Trainer-led** — trainees link to a trainer who assigns personalized workout and diet plans, provides coaching feedback, and monitors progress.

The system also includes an admin panel for user management and global content management.

---

## 2. Setup Instructions

### Prerequisites

- Node.js 20+
- PostgreSQL 15+ (local or Neon.tech)
- npm
- Git

### Clone & Install

```bash
git clone <repo-url> La_Traino
cd La_Traino
```

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your credentials (see section 3)
npx prisma migrate deploy
npm run seed
npm run dev
```

Server starts at `http://localhost:5000`.

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your credentials (see section 3)
npm run dev
```

Frontend starts at `http://localhost:5173`.

---

## 3. Environment Variables

### Backend (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (local or Neon) |
| `JWT_SECRET` | Yes | Random string at least 32 chars for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID (from Google Cloud Console) |
| `FRONTEND_URL` | Yes | Frontend origin for CORS (e.g. `http://localhost:5173` or Vercel URL) |
| `PORT` | No | Server port (default: 5000) |

### Frontend (`client/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Backend API URL (e.g. `http://localhost:5000/api`) |
| `VITE_GOOGLE_CLIENT_ID` | Yes | Google OAuth client ID (same as backend) |

---

## 4. Demo Accounts

After running `npm run seed`, the following accounts are available:

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| **ADMIN** | `admin@latraino.com` | `admin123` | Full system access |
| **ADMIN** | `admin@latraino.demo` | `Password123` | Fallback admin |
| **TRAINER** | `trainer@latraino.demo` | `Password123` | Rich demo — 2 linked trainees, coaching data |
| **TRAINER** | `sarah.jenkins@example.com` | `password123` | Code: TRNR01 — 3 linked trainees |
| **TRAINER** | `marcus.chen@example.com` | `password123` | Code: TRNR02 — 3 linked trainees |
| **TRAINEE** | `trainee1@latraino.demo` | `Password123` | Linked — 10-week exercise history |
| **TRAINEE** | `trainee2@latraino.demo` | `Password123` | Linked — full demo data |
| **TRAINEE** | `emily.r@example.com` | `password123` | Linked to Sarah Jenkins |
| **TRAINEE** | `james.t@example.com` | `password123` | Linked to Sarah Jenkins |
| **TRAINEE** | `sophia.k@example.com` | `password123` | Linked to Sarah Jenkins |

---

## 5. Demo Script

### 5.1 Admin Walkthrough

1. Navigate to `http://localhost:5173/login`
2. Login as `admin@latraino.com` / `admin123`
3. **Admin Dashboard** — view system statistics (total users, trainers, trainees)
4. **Users** — browse user table, search by name/email, toggle enable/disable
5. **Global Presets** — create a new global workout preset with name, description, exercises
6. **Presets** — create/edit/delete preset workout programs for self-guided trainees

### 5.2 Trainer Walkthrough

1. Login as `trainer@latraino.demo` / `Password123`
2. **Dashboard** — view trainer code (e.g. `ABCD12`), see linked trainees with last-log badges
3. Click a trainee card → **Assign Workout** — use drag-and-drop exercise builder
4. Click a trainee → **Assign Diet** — custom mode or use a diet template
5. **Calendar** — view month, click a day to see assignment drawer
6. **Coaching Hub** — select a trainee, view timeline, send coaching notes
7. **Templates** — create a workout template, import from global library
8. **Diet Templates** — create a diet template with per-meal food planning
9. **History** — browse past assignments, edit and reassign, or duplicate
10. **Analytics** — view completion rates and active/inactive trends
11. **Exercise Library** — add/edit exercises with muscle group targeting
12. **Food Library** — add/edit food items with macronutrient data

### 5.3 Trainee Walkthrough (Trainer-Linked)

1. Login as `trainee1@latraino.demo` / `Password123`
2. **Dashboard** — view today's workout, diet plan, weekly progress, latest feedback
3. **Workouts** — track sets, reps, weight with real-time autosave; mark complete
4. **Diet** — view meals, mark items complete; mark entire diet complete
5. **Progress** — weekly completion bar chart, trainer feedback messages
6. **Calendar** — monthly calendar with workout/diet status dots
7. **Exercise History** — search an exercise name, view progression chart + personal bests

### 5.4 Trainee Walkthrough (Self-Guided)

1. Register as a new trainee (or use existing unlinked trainee)
2. **Presets** — browse available preset workout programs
3. Select a preset → start following daily workouts
4. **Workouts** — view daily exercises, log completion
5. **Progress** — view weekly chart
6. **Link Trainer** — enter a trainer code to switch to trainer-led mode

---

## 6. Features to Showcase

| # | Feature | How to Show |
|---|---------|-------------|
| 1 | Registration with role toggle | Register a new trainee + trainer account |
| 2 | Google OAuth | Use "Sign in with Google" button |
| 3 | Trainer code generation | View trainer dashboard to see unique 6-char code |
| 4 | Trainer-trainee linking | Login as trainee, enter trainer code |
| 5 | Drag-and-drop workout builder | Trainer assign workout page |
| 6 | Workout tracking with per-set progress | Trainee workouts page |
| 7 | Diet plan assignment & tracking | Trainer assign diet + trainee diet page |
| 8 | Weekly progress chart | Trainee progress page |
| 9 | Calendar (month/week/day) | Both trainer and trainee calendar |
| 10 | Coaching hub with timeline | Trainer coaching hub page |
| 11 | Workout templates (CRUD + import) | Trainer templates page |
| 12 | Diet templates (CRUD + import) | Trainer diet templates page |
| 13 | Global preset library (admin) | Admin global presets page |
| 14 | Exercise library with search/filters | Trainer exercise library page |
| 15 | Food library with macronutrients | Trainer food library page |
| 16 | Exercise history with charts | Trainee exercise history page |
| 17 | Admin user management | Admin users page |
| 18 | Analytics dashboard | Trainer analytics page |
| 19 | History browsing with edit/duplicate | Trainer history page |
| 20 | Mobile responsive design | Resize browser to mobile width |

---

## 7. Known Limitations

| Limitation | Impact | Future Enhancement |
|------------|--------|-------------------|
| No refresh tokens | JWT expires after 24h, user must re-login | Add refresh token rotation |
| localStorage for JWT | Vulnerable to XSS (mitigated by small audited codebase) | Switch to httpOnly cookies |
| No rate limiting | Login endpoint vulnerable to brute force | Add express-rate-limit |
| No WebSocket notifications | Users must refresh to see updates | Add Socket.io or SSE |
| No mobile app | Web-only on mobile browsers | Build React Native app |
| Google OAuth needs real client IDs | Demo won't work without Google Cloud setup | User creates own client ID |
| No email verification | Any email accepted at registration | Add email verification flow |
| No pagination on large datasets | Performance degrades with 1000+ users/trainees | Add cursor-based pagination |

---

## 8. Viva Talking Points

### Architecture

- **Why monolithic instead of microservices?** MVP scope — two developers, $0 budget. Monolithic is simpler to deploy and maintain. The decoupled frontend/backend allows independent scaling if needed.
- **Why JWT over session cookies?** Frontend (Vercel) and backend (Render) are on different domains. JWT in Authorization header avoids CORS issues with cookies. Trade-off: XSS vulnerability accepted for college project scope.
- **Why Prisma ORM?** Type-safe queries, auto-generated migrations, excellent documentation. The adapter-pg pattern with pg.Pool was needed for Prisma v7 compatibility.
- **Why junction table for linking instead of FK on User?** Keeps relationship metadata separate, supports future features like linking history or multiple trainer requests. Unique constraint on traineeId enforces one-active-trainer rule.

### Design Decisions

- **Single /register endpoint** instead of separate /register-trainer and /register-trainee — DRY principle, cleaner UX with role toggle.
- **JSON columns for exercises/meals** instead of normalized tables — simpler queries for day-level data, acceptable for MVP. JSON validated in service layer.
- **bcryptjs over bcrypt** — pure JavaScript, no native compilation needed on Render's free tier.
- **Express v5** — automatic async error catching eliminates need for try-catch wrappers in controllers.

### Security

- Passwords hashed with bcrypt (10 rounds), never logged or returned.
- JWT secret stored in .env, never committed.
- Admin self-disable and admin-on-admin disable both blocked at service layer.
- CORS allowlist restricts API access to known frontend origins.
- Password policy enforced (min 8 chars, uppercase, lowercase, digit) via shared validation utility.

---

## 9. Architecture Summary

```
+-------------------+       +------------------------+       +--------------+
|   React SPA       | ----> |   Express REST API     | ----> |  PostgreSQL  |
|   (Vite 8)        |  HTTP |   (Node.js / Express 5)|  SQL  |  (Neon)      |
|   Tailwind CSS 4  |       |   Prisma 7 ORM         |       |              |
|   React Router 7  | <---- |   JWT + Google OAuth   | <---- |              |
+-------------------+       +------------------------+       +--------------+
         |                              |
    Vercel deploy                  Render deploy
```

### Frontend
- 8 trainee pages, 14 trainer pages, 4 admin pages, 7 shared/public pages
- 46 reusable components (calendar, charts, modals, forms, cards)
- 14 API client modules
- Role-based routing via ProtectedRoute component

### Backend
- 15 route modules, 80+ API endpoints
- 3 middleware (protect, restrictTo, error handler)
- Service layer separates business logic from HTTP handling
- 17 database models, 2 enums

### Database
- 20 tables (17 models + 3 junction/supporting tables)
- Key relationships: User→TrainerLink (1:N), User→TraineeProfile (1:1), User→TrainerProfile (1:1)
- JSON columns in AssignedWorkout, WorkoutLog, DietPlan, WorkoutTemplate, DietTemplate, GlobalWorkoutPreset, GlobalDietPreset

---

## 10. Team Members

| Name | Student ID | Role |
|------|-----------|------|
| Laxman Paudel | 79010051 | Full-stack developer |
| Bijaya Paudel | 79010023 | Full-stack developer |
| Roshan Poudel | 79010096 | Full-stack developer |

**Department of Statistics and Computer Science**  
Patan Multiple Campus, Tribhuvan University  
2026

---

*This guide accompanies the La Traino project submission. Refer to `SDD.md` for detailed design documentation, `README.md` for quick start, and `docs/PROJECT_SPEC.md` for the full specification.*
