# Project Specification — La Traino

**Single Source of Truth**

---

## 1. Project Overview

La Traino is a multi-vendor fitness web application that connects trainers and trainees through a digital platform. The system supports both self-guided trainees using preset workout routines and trainer-guided trainees who receive personalised workout and diet plans. The application is accessible across devices and offers flexibility, scalability, and ease of use.

**Team:** Laxman Paudel (79010051), Bijaya Paudel (79010023), Roshan Poudel (79010096)  
**Institution:** Patan Multiple Campus, Tribhuvan University  
**Program:** BSc CSIT

---

## 2. Objectives

- Develop a web application that links trainers with their trainees digitally
- Provide a standard preset workout routine for self-guided trainees
- Provide features for trainers to assign personalised workout and diet plans
- Track workout completion and progress of the trainee
- Provide weekly progress visualisation and trainer feedback

---

## 3. User Roles

| Role | Description |
|---|---|
| **Trainee (Self-Guided)** | Exercises using preset workout routines, logs daily completion, views own progress |
| **Trainee (Trainer-Linked)** | All self-guided abilities plus receives personalised workout/diet plans and weekly feedback from a trainer |
| **Trainer** | Receives a unique alphanumeric trainer code on registration, manages linked trainees, assigns personalised workout and diet plans, views logs, writes weekly feedback |
| **Admin** | Manages users (view/disable), seeds and edits preset workout routines |

---

## 4. Functional Requirements

Derived from the approved proposal (Section 4.1.3.1):

- User registration and login (Trainer / Trainee)
- Preset workout routine access
- Trainer code generation and trainee linking
- Personalised workout and diet assignment
- Workout completion tracking
- Weekly progress charts and trainer feedback
- Login with Google OAuth

---

## 5. Non-functional Requirements

Derived from the approved proposal (Section 4.1.3.2):

- **Availability** — Usable across all devices and locations via web browser
- **Reliability** — Data must be secure
- **User Interaction** — Attractive and easy-to-use interface
- **Budget** — Entire system must use freely available tools and resources ($0 budget)

---

## 6. Approved Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React (Vite), React Router, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| ORM | Prisma |
| Authentication | Email & Password (JWT + bcrypt), Google OAuth |

---

## 7. MVP Scope

The MVP includes:

- Registration and login for both trainers and trainees
- Email/password and Google OAuth authentication
- Self-guided mode: browse and select preset workout routines, log daily exercise completion, view weekly progress chart
- Trainer-led mode: unique trainer code links trainees to trainers; trainers assign personalised workout and diet plans; trainees view assigned plans and log completion; trainers view logs and write weekly feedback
- Admin panel: manage users and preset workout routines
- Fully responsive web interface

Out of scope for MVP:

- Mobile apps (iOS/Android)
- Real-time chat or video calls
- Payment processing
- Integration with wearable devices
- Automated workout generation using AI
- Public trainer discovery or marketplace

---

## 8. Pages

### Public

| Route | Page |
|---|---|
| `/` | Landing page |
| `/login` | Login |
| `/register` | Register as Trainee |
| `/register-trainer` | Register as Trainer |

### Trainee Pages

| Route | Page |
|---|---|
| `/trainee/dashboard` | Dashboard |
| `/trainee/workouts` | View daily workout plan and log completion |
| `/trainee/diet` | View assigned diet plan |
| `/trainee/progress` | Weekly progress chart |
| `/trainee/link-trainer` | Enter trainer code to link |
| `/trainee/presets` | Browse and select preset routine |

### Trainer Pages

| Route | Page |
|---|---|
| `/trainer/dashboard` | Dashboard (shows trainer code, stats) |
| `/trainer/trainees` | List of linked trainees |
| `/trainer/trainees/:id/workout` | Assign workout plan |
| `/trainer/trainees/:id/diet` | Assign diet plan |
| `/trainer/trainees/:id/feedback` | View logs and write feedback |

### Admin Pages

| Route | Page |
|---|---|
| `/admin/dashboard` | Dashboard with stats |
| `/admin/users` | Manage users |
| `/admin/presets` | Manage preset workout routines |

---

## 9. Features by Role

### Trainee (Self-Guided)

- Register with email or Google
- Login with email or Google
- Browse preset workout routines
- Select and follow a preset routine
- Log daily workout completion
- View weekly progress chart

### Trainee (Trainer-Linked)

- All features of self-guided trainee
- Link to a trainer using trainer code
- Receive personalised workout and diet plans from trainer
- Receive weekly feedback from trainer

### Trainer

- Register with email or Google
- Login with email or Google
- Receive a unique 6-character alphanumeric trainer code on registration
- View list of linked trainees
- Assign personalised workout plans to individual trainees
- Assign personalised diet plans to individual trainees
- View trainee workout logs
- Write weekly feedback for each trainee

### Admin

- Login with pre-seeded admin credentials
- View dashboard with system stats
- View and disable users
- Create, edit, and delete preset workout routines

---

## 10. Database Entities

Only entity names — no schema or fields:

- User
- TrainerProfile
- TraineeProfile
- TrainerLink
- PresetWorkout
- PresetWorkoutDay
- PresetWorkoutExercise
- AssignedWorkout
- DietPlan
- WorkoutLog
- Feedback

---

## 11. API Modules

Only module names — no endpoints:

- Auth
- Trainee
- Trainer
- Admin
- Workout
- Progress

---

## 12. Deployment Plan

| Layer | Free-Tier Service |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Source code | GitHub (private repo) |

Environment variables required: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`.

---

## 13. Project Milestones

### Milestone 1: Foundation (Weeks 1–2)

- Initialise Vite + React project with Tailwind and routing skeleton
- Initialise Express project with Prisma and PostgreSQL connection
- Create Prisma schema and run initial migration
- Implement auth (register, login, JWT middleware, Google OAuth)
- Build auth pages (Login, Register, RegisterTrainer)
- Build AuthContext, ProtectedRoute, Layout, Navbar

### Milestone 2: Preset Workouts & Self-Guided Flow (Weeks 3–4)

- Seed at least 2 preset workout routines
- Implement preset workout API
- Build trainee Dashboard, PresetWorkouts, Workouts, Progress pages
- Implement workout log API
- Build admin ManagePresets page

### Milestone 3: Trainer-Trainee Linking (Week 5)

- Implement trainer code generation (6-char alphanumeric)
- Build LinkTrainer page for trainees
- Implement link API with validation
- Build trainer Dashboard and MyTrainees page

### Milestone 4: Trainer Personalisation (Weeks 6–7)

- Implement trainer API: assign workout, assign diet, view logs, write feedback
- Build AssignWorkout, AssignDiet, Feedback pages for trainer
- Show assigned plans on trainee side
- Display feedback on trainee Progress page

### Milestone 5: Polish & Deployment (Week 8)

- Build Admin Dashboard and ManageUsers page
- Form validation, loading states, error handling
- Responsive layout pass (mobile-first)
- Seed script for demo data
- Deploy to free-tier hosting
- Final testing and bug fixes
