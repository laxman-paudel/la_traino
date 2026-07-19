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

### Public (No Auth Required)

| Route | Page |
|---|---|
| `/` | Landing page |
| `/choose-role` | Role selection before login/register |
| `/login` | Login (email/password + Google OAuth) |
| `/register` | Register with role toggle (Trainee/Trainer) |

### Trainee Pages (Role: TRAINEE)

| Route | Page |
|---|---|
| `/trainee/dashboard` | Dashboard — today's workout, diet, progress, feedback |
| `/trainee/workouts` | Track daily workout with per-set progress |
| `/trainee/diet` | View and track assigned diet plan |
| `/trainee/progress` | Weekly progress chart + trainer feedback |
| `/trainee/calendar` | Monthly/weekly view of scheduled workouts and diet plans |
| `/trainee/link-trainer` | Enter 6-char trainer code to link |
| `/trainee/presets` | Browse and select preset workout programs |
| `/trainee/exercise-history/:exerciseName` | Per-exercise progression chart with personal bests |

### Trainer Pages (Role: TRAINER)

| Route | Page |
|---|---|
| `/trainer/dashboard` | Dashboard — trainer code, linked trainees, quick actions |
| `/trainer/calendar` | Monthly/weekly calendar with assignment drawer |
| `/trainer/trainees/:id/workout` | Drag-and-drop workout builder |
| `/trainer/trainees/:id/diet` | Diet assignment (custom or template) |
| `/trainer/trainees/:id/logs` | Trainee workout log viewer |
| `/trainer/trainees/:id/feedback` | Write and view weekly feedback |
| `/trainer/trainees/:id/exercise-history/:exerciseName` | Trainee's per-exercise performance |
| `/trainer/templates` | Workout template CRUD + import from global library |
| `/trainer/diet-templates` | Diet template CRUD + import from global library |
| `/trainer/exercises` | Exercise library management |
| `/trainer/foods` | Food item management |
| `/trainer/coaching` | Coaching hub — timeline, feedback, comments |
| `/trainer/history` | Browse past assignments with edit/duplicate |
| `/trainer/analytics` | Trainee performance analytics |

### Admin Pages (Role: ADMIN)

| Route | Page |
|---|---|
| `/admin/dashboard` | Dashboard with system statistics |
| `/admin/users` | User management table with search, sort, enable/disable |
| `/admin/presets` | Preset workout CRUD |
| `/admin/global-presets` | Global workout and diet template CRUD |

### Shared Pages (Any Authenticated Role)

| Route | Page |
|---|---|
| `/profile` | View/edit name, email, profile image, personal details |
| `/settings` | Change password, notification preferences |
| `*` | Custom 404 page with role-aware navigation |

---

## 9. Features by Role

### Trainee (Self-Guided)

- Register with email or Google (role: TRAINEE)
- Login with email or Google
- Browse preset workout programs
- Select and follow a preset routine
- Log daily workout completion with per-set tracking
- View weekly progress chart with completion rate
- Calendar view of preset schedule
- View exercise performance history with personal bests and progression charts
- View/edit profile and change password

### Trainee (Trainer-Linked)

- All features of self-guided trainee
- Link to a trainer using 6-character trainer code
- Unlink from trainer (clears assignments, preserves history)
- Receive personalised workout and diet plans from trainer
- Track per-set progress (sets, reps, weight) with autosave
- Track per-meal diet completion
- Receive weekly feedback from trainer
- View trainer's coaching notes, exercise comments, and diet comments
- Calendar view of scheduled workouts and diet plans

### Trainer

- Register with email or Google (role: TRAINER)
- Login with email or Google
- Receive a unique 6-character alphanumeric trainer code on registration
- View dashboard with linked trainees, recent activity, and quick stats
- Assign personalised workout plans to individual trainees (drag-and-drop builder)
- Assign personalised diet plans (custom mode or from template)
- Bulk assign workouts to multiple trainees
- Bulk assign diet plans to multiple trainees
- Create, edit, duplicate, archive, favorite workout templates
- Import global workout presets into personal templates
- Create, edit, duplicate, archive, favorite diet templates
- Import global diet presets into personal templates
- Weekly calendar view with per-day workout/diet distribution
- Coaching hub: timeline, coaching notes, exercise comments, diet comments
- View trainee workout logs
- Write and view weekly feedback for each trainee
- View trainee exercise performance history with charts
- Browse past assignments with edit and reassign/duplicate
- Analytics dashboard (completion rates, active/inactive trends)
- Manage exercise library (CRUD with search/filters)
- Manage food library (CRUD with search/filters)
- Unlink trainees (deletes assignments, preserves logs)

### Admin

- Login with pre-seeded admin credentials
- View dashboard with system statistics (total users, trainers, trainees)
- View and search all users
- Enable/disable user accounts (guards against self-disable and admin-on-admin)
- Create, edit, and delete preset workout programs
- Create, edit, and delete global workout presets (importable by trainers)
- Create, edit, and delete global diet presets (importable by trainers)

---

## 10. Database Entities (17 models)

| Entity | Purpose |
|--------|---------|
| User | Core identity — all roles (ADMIN, TRAINER, TRAINEE) |
| TrainerProfile | Extended profile with unique 6-char trainer code |
| TraineeProfile | Extended profile with fitness goal and preset selection |
| TrainerLink | Junction table for trainer–trainee relationship (unique traineeId) |
| AssignedWorkout | Trainer-assigned workout for a trainee on a specific day |
| WorkoutLog | Trainee's actual workout completion record with per-set progress |
| DietPlan | Trainer-assigned diet plan for a trainee on a specific day |
| Feedback | Trainer weekly feedback for a trainee |
| CoachingNote | Structured coaching note from trainer to trainee |
| ExerciseComment | Trainer comment on a specific exercise (unique per trainee) |
| DietComment | Trainer comment on a specific meal type (unique per trainee) |
| Exercise | Exercise library item (admin/trainer created) |
| FoodItem | Food library item (trainer created) |
| WorkoutTemplate | Reusable workout template for quick assignment |
| DietTemplate | Reusable diet template for quick assignment |
| GlobalWorkoutPreset | Admin-created global workout template for trainer import |
| GlobalDietPreset | Admin-created global diet template for trainer import |
| PresetWorkout | Multi-day preset program for self-guided trainees |
| PresetWorkoutDay | Single day within a preset program |
| PresetWorkoutExercise | Single exercise within a preset day |

---

## 11. API Modules

| Module | Base Path | Description |
|--------|-----------|-------------|
| Auth | `/api/auth` | Register, login, Google OAuth, get current user |
| Trainee | `/api/trainee` | Link/unlink trainer, workout/diet tracking, feedback, presets, coaching comments, exercise history |
| Trainer | `/api/trainer` | Dashboard, assign workout/diet, bulk assign, logs, feedback, unlink, history, analytics, global presets |
| Templates | `/api/trainer/templates` | Workout template CRUD, duplicate, archive, restore, favorite, assign, import global |
| Diet Templates | `/api/trainer/diet-templates` | Diet template CRUD, duplicate, archive, restore, favorite, assign, import global |
| Coaching | `/api/trainer/coaching` | Timeline, coaching notes, exercise comments, diet comments |
| Admin | `/api/admin` | Dashboard stats, user management, preset CRUD, global preset CRUD |
| Calendar | `/api/calendar` | Monthly events (trainer + trainee views), upcoming workouts |
| Progress | `/api/progress` | Weekly completion data |
| Exercises | `/api/exercises` | Exercise library CRUD with search/filters |
| Foods | `/api/foods` | Food library CRUD with search/filters |
| Profile | `/api/profile` | Get/update profile, avatar upload |
| Settings | `/api/settings` | Change password, preferences |
| Exercise History | `/api/trainee/exercise-history` | Per-exercise history with personal bests |

---

## 12. Deployment Plan

| Layer | Free-Tier Service |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Neon PostgreSQL |
| Source code | GitHub (private repo) |

Environment variables required: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL` (backend CORS).

---

## 13. Project Milestones

### Milestone 1: Foundation

- Initialise Vite + React project with Tailwind and routing skeleton
- Initialise Express project with Prisma and PostgreSQL connection
- Create Prisma schema (11 core models) and run initial migration
- Implement auth (register, login, JWT middleware, Google OAuth)
- Build auth pages (Login, Register with role toggle, Landing, ChooseRole)
- Build AuthContext, ProtectedRoute, AppLayout, Sidebar, TopNavbar

### Milestone 2: Preset Workouts & Self-Guided Flow

- Seed 3+ preset workout routines
- Implement preset workout API (list, select)
- Build trainee Dashboard, Presets, Workouts, Progress pages
- Implement workout log API (get, update progress, complete)

### Milestone 3: Trainer-Trainee Linking

- Implement trainer code generation (6-char alphanumeric)
- Build LinkTrainer page for trainees
- Implement link/unlink API with validation
- Build trainer Dashboard with trainee cards

### Milestone 4: Trainer Personalisation

- Implement trainer API: assign workout, assign diet, view logs, write feedback
- Build AssignWorkout (drag-and-drop), AssignDiet, TraineeLogs, Feedback pages
- Show assigned plans and feedback on trainee side
- Add diet tracking for trainees

### Milestone 5: Calendar, Templates & Coaching

- Build calendar API and components (month/week/day views)
- Implement template system (workout + diet template CRUD, duplicate, archive, favorite)
- Implement global preset system for admin (workout + diet)
- Build template import, assign, and bulk assign workflows
- Add coaching hub with timeline, coaching notes, exercise/diet comments

### Milestone 6: Advanced Features & Admin

- Add exercise library (CRUD with search/filters)
- Add food library (CRUD with search/filters)
- Add history browsing with edit/duplicate/reassign
- Add analytics dashboard (completion rates, active trends)
- Build admin dashboard, user management, global preset management
- Add exercise history with per-exercise progression charts

### Milestone 7: Polish & Deployment

- Form validation, password policy (uppercase, lowercase, number, min 8)
- Loading states, empty states, error handling, toast notifications
- Responsive layout pass (mobile sidebar, scrollable week view)
- Comprehensive seed script (13 accounts, 190+ exercises, demo data)
- CORS production config with allowlist
- Unlink auth context refresh
- Deploy to free-tier hosting (Vercel + Render + Neon)
- Final testing and documentation alignment
