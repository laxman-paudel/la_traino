# Software Design Document — La Traino

**Project:** La Traino — A Personalized Physical Training System  
**Version:** 1.0  
**Prepared for:** Department of Statistics and Computer Science, Patan Multiple Campus  
**Team:** Laxman Paudel (79010051), Bijaya Paudel (79010023), Roshan Poudel (79010096)

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Folder Structure](#2-folder-structure)
3. [Database Schema](#3-database-schema)
4. [User Roles](#4-user-roles)
5. [Page List](#5-page-list)
6. [API Endpoints](#6-api-endpoints)
7. [User Flows](#7-user-flows)
8. [Implementation Milestones](#8-implementation-milestones)

---

## 1. Architecture Overview

### 1.1 System Architecture

Monolithic web application with a decoupled frontend/backend. Both layers are served separately — the React SPA communicates with the Express REST API over HTTP.

```
+-------------------+       +-------------------+       +------------+
|   React (Vite)    | ----> |  Express (Node)   | ----> | PostgreSQL |
|   Tailwind CSS    |  HTTP |  Prisma ORM       |  SQL  |            |
|   React Router    | <---- |  JWT Auth         | <---- |            |
+-------------------+       +-------------------+       +------------+
```

- **Client:** React SPA, routed client-side via React Router, styled with Tailwind.
- **Server:** Stateless Express.js REST API. Authentication via JWT (access token in `Authorization: Bearer <token>` header). File uploads stored on disk under `/uploads`.
- **Database:** PostgreSQL accessed exclusively through Prisma.
- **No caching layer, no message queue, no microservices** — MVP simplicity.

### 1.2 Authentication Strategy

- **JWT-based:** On login, server returns a signed JWT containing `{ userId, role }`. Token expiry: 24 hours.
- **Middleware:** A `protect` middleware decodes the token and attaches `req.user`. A `restrictTo(...roles)` middleware gates role-specific routes.
- **Password storage:** bcrypt with 10 salt rounds.

### 1.3 Trainer-Trainee Linking

Implemented as proposed: each trainer gets a unique 6-character alphanumeric code (e.g. `TRN4582`) on registration. Trainees enter this code to link themselves to a trainer. The link is stored as a foreign-key relationship in the `User` table.

---

## 2. Folder Structure

```
la-traino/
├── client/                          # React (Vite) frontend
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── api/                     # Axios instance and endpoint helpers
│   │   │   ├── axios.js
│   │   │   ├── auth.js
│   │   │   ├── workouts.js
│   │   │   ├── progress.js
│   │   │   └── admin.js
│   │   ├── components/              # Shared/reusable UI components
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   └── ProgressChart.jsx
│   │   ├── pages/                   # Route-level page components
│   │   │   ├── auth/
│   │   │   │   ├── Login.jsx
│   │   │   │   ├── Register.jsx
│   │   │   │   └── RegisterTrainer.jsx
│   │   │   ├── trainee/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Workouts.jsx
│   │   │   │   ├── DietPlan.jsx
│   │   │   │   ├── Progress.jsx
│   │   │   │   ├── LinkTrainer.jsx
│   │   │   │   └── PresetWorkouts.jsx
│   │   │   ├── trainer/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── MyTrainees.jsx
│   │   │   │   ├── AssignWorkout.jsx
│   │   │   │   ├── AssignDiet.jsx
│   │   │   │   └── Feedback.jsx
│   │   │   ├── admin/
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── ManageUsers.jsx
│   │   │   │   └── ManagePresets.jsx
│   │   │   └── NotFound.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── server/                          # Express backend
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── seed.js
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                # Prisma client singleton
│   │   ├── middleware/
│   │   │   ├── protect.js           # JWT verification
│   │   │   ├── restrictTo.js        # Role-based gate
│   │   │   └── errorHandler.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── trainerRoutes.js
│   │   │   ├── traineeRoutes.js
│   │   │   ├── adminRoutes.js
│   │   │   ├── workoutRoutes.js
│   │   │   └── progressRoutes.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── trainerController.js
│   │   │   ├── traineeController.js
│   │   │   ├── adminController.js
│   │   │   ├── workoutController.js
│   │   │   └── progressController.js
│   │   ├── utils/
│   │   │   ├── generateTrainerCode.js
│   │   │   ├── AppError.js
│   │   │   └── catchAsync.js
│   │   └── app.js                   # Express app setup
│   ├── uploads/                     # Trainer-uploaded resources (gitignored)
│   ├── server.js                    # Entry point
│   ├── package.json
│   └── .env
│
├── .gitignore
└── README.md
```

---

## 3. Database Schema

### 3.1 Entity-Relationship Summary

```
User ──1:N──> WorkoutLog
User ──1:N──> DietPlan
User ──1:N──> Feedback (given by trainer)
User ──N:1──> User (trainer)   [trainerId FK on User]
PresetWorkout ──1:N──> PresetWorkoutDay
PresetWorkoutDay ──1:N──> PresetWorkoutExercise
```

### 3.2 Prisma Schema (schema.prisma)

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role {
  ADMIN
  TRAINER
  TRAINEE
}

model User {
  id             Int       @id @default(autoincrement())
  name           String
  email          String    @unique
  password       String
  role           Role      @default(TRAINEE)
  trainerCode    String?   @unique             // generated for TRAINER role only
  trainerId      Int?                            // FK to another User (trainer)
  trainer        User?     @relation("TrainerTrainee", fields: [trainerId], references: [id])
  trainees       User[]    @relation("TrainerTrainee")
  workoutLogs    WorkoutLog[]
  dietPlans      DietPlan[]
  feedbackGiven  Feedback[] @relation("FeedbackGiven")  // trainer gives feedback
  feedbackRecv   Feedback[] @relation("FeedbackRecv")   // trainee receives
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

model PresetWorkout {
  id          Int                 @id @default(autoincrement())
  name        String              // e.g. "Full Body Beginner"
  description String?
  days        PresetWorkoutDay[]
}

model PresetWorkoutDay {
  id         Int                 @id @default(autoincrement())
  dayName    String              // e.g. "Day 1 — Chest & Triceps"
  presetId   Int
  preset     PresetWorkout       @relation(fields: [presetId], references: [id])
  exercises  PresetWorkoutExercise[]
}

model PresetWorkoutExercise {
  id       Int              @id @default(autoincrement())
  name     String           // e.g. "Bench Press"
  sets     Int
  reps     Int
  dayId    Int
  day      PresetWorkoutDay @relation(fields: [dayId], references: [id])
}

model WorkoutLog {
  id        Int      @id @default(autoincrement())
  traineeId Int
  trainee   User     @relation(fields: [traineeId], references: [id])
  day       DateTime                                          // the day this workout is for
  exercises Json                                              // [{name, sets, reps, completed: bool}]
  note      String?
  createdAt DateTime @default(now())
}

model DietPlan {
  id        Int      @id @default(autoincrement())
  traineeId Int
  trainee   User     @relation(fields: [traineeId], references: [id])
  meals     Json                                              // [{mealName, items: [{food, qty}]}]
  day       DateTime
  createdAt DateTime @default(now())
}

model Feedback {
  id          Int      @id @default(autoincrement())
  trainerId   Int
  trainer     User     @relation("FeedbackGiven", fields: [trainerId], references: [id])
  traineeId   Int
  trainee     User     @relation("FeedbackRecv", fields: [traineeId], references: [id])
  weekStart   DateTime
  message     String
  createdAt   DateTime @default(now())
}
```

### Key Design Decisions

- **trainerCode** is the 6-char alphanumeric key per the proposal. A unique constraint guarantees no duplicates.
- **trainerId** on `User` is the link. `null` means the trainee is self-guided.
- **WorkoutLog.exercises** and **DietPlan.meals** use `Json` columns to avoid explosion of relational tables for exercise line-items. This keeps the schema flat for an MVP. The structure is validated in the controller layer.
- **PresetWorkout** is a separate hierarchy so the admin can seed standard routines that self-guided trainees can pick from.

---

## 4. User Roles

| Role | Capabilities |
|---|---|
| **Trainee (self-guided)** | Register, browse and select a preset workout routine, log daily workout completion, view own progress chart. |
| **Trainee (trainer-linked)** | All self-guided abilities **plus**: receive personalised workout/diet plans from linked trainer, send progress data visible to trainer, receive weekly feedback from trainer. |
| **Trainer** | Register (system generates unique trainer code), view list of linked trainees, assign custom workout routines and diet plans to each trainee, view trainee workout logs, write weekly feedback. |
| **Admin** | Manage (view/disable) users, seed and edit preset workout routines, view all trainer-trainee relationships (read-only). |

---

## 5. Page List

### 5.1 Public (no auth required)

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Hero, feature highlights, CTA to register/login |
| `/login` | Login | Email + password form |
| `/register` | Register (Trainee) | Name, email, password, optional trainer code |
| `/register-trainer` | Register (Trainer) | Name, email, password |

### 5.2 Trainee Pages

| Route | Page | Description |
|---|---|---|
| `/trainee/dashboard` | Dashboard | Greeting, today's workout summary, quick stats |
| `/trainee/workouts` | Workouts | View daily workout plan (preset or trainer-assigned), mark exercises complete |
| `/trainee/diet` | Diet Plan | View assigned diet plan (if linked to trainer) |
| `/trainee/progress` | Progress | Weekly chart showing completion % over time |
| `/trainee/link-trainer` | Link Trainer | Input field for trainer code to link |
| `/trainee/presets` | Preset Workouts | Browse and select a preset routine |

### 5.3 Trainer Pages

| Route | Page | Description |
|---|---|---|
| `/trainer/dashboard` | Dashboard | My code (to share), number of linked trainees |
| `/trainer/trainees` | My Trainees | List of linked trainees with last-active info |
| `/trainer/trainees/:id/workout` | Assign Workout | Create/edit workout plan for a specific trainee |
| `/trainer/trainees/:id/diet` | Assign Diet | Create/edit diet plan |
| `/trainer/trainees/:id/feedback` | Feedback | View trainee logs, write weekly feedback |

### 5.4 Admin Pages

| Route | Page | Description |
|---|---|---|
| `/admin/dashboard` | Dashboard | Stats: total users, trainers, trainees |
| `/admin/users` | Manage Users | Table of all users, toggle active/disabled |
| `/admin/presets` | Manage Presets | CRUD for preset workout routines |

---

## 6. API Endpoints

All endpoints return JSON. Protected routes require `Authorization: Bearer <token>`.

### 6.1 Auth

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | No | Register as trainee. Body: `{ name, email, password, trainerCode? }` |
| `POST` | `/api/auth/register-trainer` | No | Register as trainer. Body: `{ name, email, password }` |
| `POST` | `/api/auth/login` | No | Login. Body: `{ email, password }` → returns `{ token, user }` |
| `GET` | `/api/auth/me` | Yes | Return current user profile |

### 6.2 Trainee

| Method | Path | Auth | Description |
|---|---|---|---|
| `POST` | `/api/trainee/link` | Trainee | Link to a trainer. Body: `{ trainerCode }` |
| `GET` | `/api/trainee/workouts` | Trainee | Get assigned/preset workout for today |
| `POST` | `/api/trainee/workouts/log` | Trainee | Log daily workout completion. Body: `{ exercises: [...], note? }` |
| `GET` | `/api/trainee/diet` | Trainee | Get assigned diet plan |
| `GET` | `/api/trainee/progress` | Trainee | Get weekly completion data for charts |
| `GET` | `/api/trainee/presets` | Trainee | List all preset workout routines |
| `POST` | `/api/trainee/presets/:id/select` | Trainee | Select a preset routine |

### 6.3 Trainer

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/trainer/trainees` | Trainer | List linked trainees |
| `GET` | `/api/trainer/trainees/:id` | Trainer | Get a specific trainee's profile |
| `PUT` | `/api/trainer/trainees/:id/workout` | Trainer | Assign workout plan. Body: `{ exercises: [...] }` |
| `PUT` | `/api/trainer/trainees/:id/diet` | Trainer | Assign diet plan. Body: `{ meals: [...] }` |
| `GET` | `/api/trainer/trainees/:id/logs` | Trainer | View trainee's workout logs |
| `POST` | `/api/trainer/trainees/:id/feedback` | Trainer | Write weekly feedback. Body: `{ message }` |
| `GET` | `/api/trainer/code` | Trainer | Get own trainer code |

### 6.4 Admin

| Method | Path | Auth | Description |
|---|---|---|---|
| `GET` | `/api/admin/users` | Admin | List all users |
| `PATCH` | `/api/admin/users/:id/disable` | Admin | Disable a user |
| `GET` | `/api/admin/presets` | Admin | List all presets |
| `POST` | `/api/admin/presets` | Admin | Create a preset workout |
| `PUT` | `/api/admin/presets/:id` | Admin | Update a preset |
| `DELETE` | `/api/admin/presets/:id` | Admin | Delete a preset |

---

## 7. User Flows

### 7.1 Trainee — Self-Guided

```
Landing → Register → Login → Dashboard
                                 ↓
                          Browse Presets → Select Routine
                                 ↓
                      Daily: View Workout → Log Completion
                                 ↓
                    View Progress Chart (weekly)
```

### 7.2 Trainee — Trainer-Linked

```
Landing → Register (enter trainer code) → Login → Dashboard
                                                      ↓
                                            Receive assigned workout/diet plans
                                                      ↓
                                        Daily: Log workout completion
                                                      ↓
                                        View progress chart + trainer feedback
```

### 7.3 Trainer

```
Landing → Register as Trainer → Login → Dashboard (see my code: TRNXXXX)
                                             ↓
                                    Share code with trainees
                                             ↓
                                    View linked trainees list
                                             ↓
                          Select trainee → Assign workout plan
                          Select trainee → Assign diet plan
                          Select trainee → View logs → Write feedback
```

### 7.4 Admin

```
Login (admin seed account) → Admin Dashboard
                                  ↓
                    Manage Users (disable problematic accounts)
                    Manage Presets (create/edit/delete routines)
```

---

## 8. Implementation Milestones

### Milestone 1: Foundation (Weeks 1-2)

- [ ] Initialize Vite + React project, install Tailwind, set up routing skeleton
- [ ] Initialize Express project with Prisma, connect to PostgreSQL
- [ ] Create Prisma schema, run initial migration
- [ ] Implement auth endpoints: register (trainee + trainer), login, JWT middleware
- [ ] Build auth pages (Login, Register, RegisterTrainer)
- [ ] Build AuthContext, ProtectedRoute, basic Layout/Navbar

### Milestone 2: Preset Workouts & Self-Guided Flow (Weeks 3-4)

- [ ] Seed preset workout data (at least 2 full routines)
- [ ] Implement PresetWorkout API (admin CRUD + trainee read/select)
- [ ] Build trainee pages: Dashboard, PresetWorkouts, Workouts (view + log)
- [ ] Implement WorkoutLog API
- [ ] Build Progress page with a weekly chart (use a lightweight chart lib or SVG)
- [ ] Build admin pages: ManagePresets

### Milestone 3: Trainer-Trainee Linking (Week 5)

- [ ] Implement trainer code generation algorithm (6-char alphanumeric)
- [ ] Build LinkTrainer page for trainees
- [ ] Implement link API with validation
- [ ] Show trainer code on trainer dashboard
- [ ] Build trainer dashboard + MyTrainees list

### Milestone 4: Trainer Personalisation (Weeks 6-7)

- [ ] Implement trainer API: assign workout, assign diet, view logs, write feedback
- [ ] Build trainer pages: AssignWorkout, AssignDiet, Feedback
- [ ] Show assigned plans on trainee side (Workouts, DietPlan pages)
- [ ] Display feedback on trainee Progress page

### Milestone 5: Admin, Polish & Deployment (Week 8)

- [ ] Build admin pages: ManageUsers, admin Dashboard with stats
- [ ] Implement user disable/enable
- [ ] Error handling polish, form validation, loading states
- [ ] Responsive layout pass (mobile-first)
- [ ] Write seed script for demo data
- [ ] Set up hosting (free tier: Render/Railway for backend, Vercel/Netlify for frontend)
- [ ] Final testing pass, fix bugs

---

## Deployment Strategy ($0 Budget)

| Layer | Service |
|---|---|
| Frontend (static) | Vercel or Netlify (free tier) |
| Backend (Node) | Render.com free tier or Railway free tier |
| Database | Neon.tech (PostgreSQL free tier, 0.5 GB) or Render Postgres free tier |
| Source code | GitHub (private repo) |

Environment variables: `DATABASE_URL`, `JWT_SECRET`.

---

*This document follows the approved project proposal dated July 2026. All architectural decisions assume a $0 budget and the prescribed tech stack (React/Vite, Node/Express, PostgreSQL, Prisma, JWT/bcrypt, Tailwind CSS).*
