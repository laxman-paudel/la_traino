# La Traino — AI Agent Context

This file is loaded automatically at the start of every opencode session. Read it fully before any work.

## Project

La Traino — A Personalized Physical Training System (BSc CSIT college MVP).

## Tech Stack

- **Frontend:** React (Vite), Tailwind CSS v4, React Router
- **Backend:** Node.js, Express v5, Prisma v7, PostgreSQL
- **Auth:** JWT + bcryptjs, Google OAuth (google-auth-library)
- **Deployment target:** Vercel (frontend), Render (backend), Neon (DB) — free tier

## Location

`C:\Users\user\Desktop\La_Traino`

## How to Run

```powershell
# Terminal 1 — Backend (port 5000)
cd C:\Users\user\Desktop\La_Traino\server; npm run dev

# Terminal 2 — Frontend (port 5173)
cd C:\Users\user\Desktop\La_Traino\client; npm run dev

# Tests
cd C:\Users\user\Desktop\La_Traino\server; npx vitest run
```

## Architecture Decisions

- Controllers are thin — business logic lives in `server/src/services/`.
- Single `/register` endpoint with `role` in body (no separate flows).
- JSON columns for `exercises` and `meals` in WorkoutLog, AssignedWorkout, DietPlan.
- JWT in localStorage, 24h expiry, no refresh tokens for MVP.
- `bcryptjs` (pure JS) — no native compilation needed.
- Prisma v7 requires `@prisma/adapter-pg` + `pg.Pool` in `db.js`.
- Express v5 catches async errors automatically.

## Milestones Completed

All 14 backend tests pass. Frontend builds with 0 errors.

See `docs/PROJECT_SPEC.md` for full milestone breakdown.

## What's Implemented

### Backend
- Auth: register, login, google OAuth, JWT, protect + restrictTo middleware
- Trainee: link-trainer, list presets, select preset
- Trainer: dashboard (trainer code + linked trainees)

### Frontend
- Auth: Landing, Login, Register (with role selector), AuthContext, ProtectedRoute
- Trainee: Dashboard, LinkTrainer page, Presets page (responsive card grid)

### Database
- 11 tables, 2 enums, all relationships — migration on local PostgreSQL (port 5432)

## What's NOT Implemented

- No preset workout seed data (table is empty)
- No workout logging (API or UI)
- No diet plan (API or UI)
- No feedback (API or UI)
- No admin endpoints or UI
- No progress/charts
- No trainer dashboard frontend
- Google OAuth needs real client IDs in both `.env` files

## Key Files

### Server (`server/src/`)
| File | Purpose |
|------|---------|
| `app.js` | Express app bootstrap |
| `server.js` | Entry point (dotenv + port) |
| `config/db.js` | PrismaClient with adapter-pg |
| `services/authService.js` | Register, login, googleAuth, getMe |
| `services/traineeService.js` | linkTrainer |
| `services/presetService.js` | listPresets, selectPreset |
| `services/trainerService.js` | getDashboard |
| `controllers/authController.js` | Thin auth handlers |
| `controllers/traineeController.js` | linkTrainer handler |
| `controllers/presetController.js` | listPresets, selectPreset handlers |
| `controllers/trainerController.js` | getDashboard handler |
| `routes/authRoutes.js` | POST /register, /login, /google; GET /me |
| `routes/traineeRoutes.js` | POST /link-trainer |
| `routes/presetRoutes.js` | GET /presets, POST /select-preset |
| `routes/trainerRoutes.js` | GET /dashboard |
| `middleware/protect.js` | JWT verification |
| `middleware/restrictTo.js` | Role gating |
| `utils/generateTrainerCode.js` | 6-char alphanumeric code |

### Client (`client/src/`)
| File | Purpose |
|------|---------|
| `context/AuthContext.jsx` | Auth state, login/logout, fetchMe |
| `components/ProtectedRoute.jsx` | Auth + role gating |
| `api/auth.js` | Axios instance + auth API calls |
| `api/trainee.js` | linkTrainer |
| `api/preset.js` | fetchPresets, selectPreset |
| `constants.js` | ROLE_LINKS |
| `pages/Landing.jsx` | Public landing |
| `pages/Login.jsx` | Login form + Google |
| `pages/Register.jsx` | Register form + role toggle + Google |
| `pages/trainee/Dashboard.jsx` | Trainee dashboard |
| `pages/trainee/LinkTrainer.jsx` | Link to trainer page |
| `pages/trainee/Presets.jsx` | Preset card grid |
| `pages/trainer/Dashboard.jsx` | ComingSoon placeholder |
| `pages/admin/Dashboard.jsx` | ComingSoon placeholder |
| `App.jsx` | Router + all routes |

## Working Style (from 2026-07-04 session)

- **One milestone at a time** — build, then wait for approval before next.
- **Todo lists** used for multi-step work; updated in real time as items complete.
- **No comments** in code unless they explain a non-obvious *why* (not *what*).
- **Concise communication** — short answers, minimal preamble, no emojis unless asked.
- **Ask if unsure** — the agent asks questions rather than guessing on ambiguous choices.
- **Session summaries** saved to `docs/SESSION_SUMMARY.md` at end of each session.
- **Always run lint/build** after changes before declaring done.
- **ALWAYS prefer editing existing files** — never create new files unless explicitly required.
- **Never commit** unless explicitly asked.

## Notes

- `docs/PROJECT_SPEC.md` — single source of truth for features, pages, entities
- `docs/AUTH_DESIGN.md` — auth design doc
- `docs/SESSION_SUMMARY.md` — per-session progress log (updated as we go)
- pg@9 deprecation warning on server start (`Calling client.query() when already executing...`) — known Prisma v7 compat issue, non-blocking
