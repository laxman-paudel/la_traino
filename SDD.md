# Software Design Document — La Traino

**Project:** La Traino — A Personalized Physical Training System  
**Version:** 2.0 (updated for final implementation)  
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
8. [Implementation Status](#8-implementation-status)

---

## 1. Architecture Overview

### 1.1 System Architecture

Monolithic web application with a decoupled frontend/backend. Both layers are served separately — the React SPA communicates with the Express REST API over HTTP.

```
+-------------------+       +------------------------+       +--------------+
|   React (Vite)    | ----> |  Express (Node.js)     | ----> |  PostgreSQL  |
|   Tailwind CSS    |  HTTP |  Prisma ORM            |  SQL  |  (Neon)      |
|   React Router    | <---- |  JWT / Google OAuth    | <---- |              |
+-------------------+       +------------------------+       +--------------+
```

- **Client:** React SPA, routed client-side via React Router, styled with Tailwind CSS v4.
- **Server:** Stateless Express.js REST API. Authentication via JWT (Bearer token in `Authorization` header).
- **Database:** PostgreSQL accessed exclusively through Prisma ORM (v7).
- **No caching layer, no message queue, no microservices** — MVP simplicity.

### 1.2 Authentication Strategy

- **JWT-based:** On login, server returns a signed JWT containing `{ userId, role }`. Token expiry: 24 hours.
- **Middleware:** A `protect` middleware decodes the token and attaches `req.user`. A `restrictTo(...roles)` middleware gates role-specific routes.
- **Password storage:** bcrypt with 10 salt rounds.
- **Google OAuth:** Supported via `google-auth-library`. New users select a role during first-time Google sign-in.

### 1.3 Trainer-Trainee Linking

Implemented as a dedicated `TrainerLink` junction table (not a foreign key on `User`):

```
TrainerLink {
  id         Int      @id
  trainerId  Int      → User.id
  traineeId  Int      → User.id  (unique)
  createdAt  DateTime
}
```

**Design rationale:**
- A junction table was chosen over a direct `trainerId` FK on `User` to keep the relationship metadata separate and to support future features (linking history, multiple trainer requests).
- One trainee can have at most one active trainer (`traineeId` has a `@unique` constraint).
- One trainer can have many trainees (indexed on `trainerId`).
- Unlinking deletes the row — no soft-delete for MVP.
- Trainer code generation uses a 6-character alphanumeric string (e.g. `TRN4582`) stored in `TrainerProfile.trainerCode`.

---

## 2. Folder Structure

```
La Traino/
├── client/                              # React (Vite) frontend
│   ├── public/
│   │   ├── favicon.svg                  # Custom SVG favicon
│   │   └── icons.svg                    # Icon sprite
│   ├── src/
│   │   ├── api/                         # Axios instance + endpoint helpers
│   │   │   ├── auth.js                  #  login, register, googleLogin, fetchMe
│   │   │   ├── trainee.js               #  linkTrainer, workouts, diet, feedback, unlink
│   │   │   ├── trainer.js               #  dashboard, bulk assign, history, logs
│   │   │   ├── admin.js                 #  dashboard, users, presets, global presets
│   │   │   ├── templates.js             #  workout template CRUD + import
│   │   │   ├── dietTemplates.js         #  diet template CRUD + import
│   │   │   ├── exercises.js             #  exercise library CRUD
│   │   │   ├── foods.js                 #  food library CRUD
│   │   │   ├── coaching.js              #  timeline, notes, comments
│   │   │   ├── calendar.js              #  month events, upcoming
│   │   │   ├── progress.js              #  weekly progress
│   │   │   ├── exerciseHistory.js       #  per-exercise history
│   │   │   ├── preset.js                #  fetch/select presets
│   │   │   └── profile.js              #  profile + settings
│   │   ├── components/                  # Shared UI components
│   │   │   ├── AppLayout.jsx            #  Sidebar + TopNavbar wrapper
│   │   │   ├── Calendar.jsx             #  Month/Week/Day calendar component
│   │   │   ├── PageHeader.jsx           #  Consistent page heading
│   │   │   ├── ProtectedRoute.jsx       #  Auth + role gating
│   │   │   ├── Sidebar.jsx              #  Role-aware navigation sidebar
│   │   │   ├── TopNavbar.jsx            #  Top bar with hamburger + profile
│   │   │   ├── EmptyState.jsx           #  Empty state display
│   │   │   ├── ErrorBoundary.jsx        #  React error boundary
│   │   │   ├── ErrorState.jsx           #  Error display with retry
│   │   │   ├── Skeleton.jsx             #  Loading skeleton components
│   │   │   ├── StatusBadge.jsx          #  Status indicator badge
│   │   │   ├── ConfirmDialog.jsx        #  Confirmation modal
│   │   │   ├── Pagination.jsx           #  Pagination controls
│   │   │   ├── ToastContext.jsx         #  Toast notification system
│   │   │   ├── ExercisePicker.jsx       #  Exercise selection modal
│   │   │   ├── ExerciseChart.jsx        #  Progression chart
│   │   │   ├── TemplateForm.jsx         #  Workout template form
│   │   │   ├── TemplateCard.jsx         #  Workout template card
│   │   │   ├── DietTemplateForm.jsx     #  Diet template form
│   │   │   ├── DietTemplateCard.jsx     #  Diet template card
│   │   │   ├── GlobalImportModal.jsx    #  Global library import modal
│   │   │   ├── BulkAssignModal.jsx      #  Bulk assignment modal
│   │   │   ├── CoachingTimeline.jsx     #  Activity timeline feed
│   │   │   ├── WorkoutPreview.jsx       #  Workout preview modal
│   │   │   └── (additional components)  #  Forms, cards, details, etc.
│   │   ├── context/
│   │   │   ├── AuthContext.jsx           #  Auth state provider
│   │   │   └── ToastContext.jsx         #  Toast state provider
│   │   ├── pages/
│   │   │   ├── Landing.jsx              #  Public landing page
│   │   │   ├── Login.jsx                #  Login form + Google OAuth
│   │   │   ├── Register.jsx             #  Registration with role toggle
│   │   │   ├── ChooseRole.jsx           #  Pre-login role selector
│   │   │   ├── NotFound.jsx             #  404 page
│   │   │   ├── Profile.jsx              #  Shared profile (all roles)
│   │   │   ├── Settings.jsx             #  Shared settings (all roles)
│   │   │   ├── trainee/
│   │   │   │   ├── Dashboard.jsx        #  Today overview, progress, feedback
│   │   │   │   ├── Calendar.jsx         #  Monthly/weekly schedule
│   │   │   │   ├── Workouts.jsx         #  Workout tracking with sets/reps
│   │   │   │   ├── Diet.jsx             #  Diet plan tracking
│   │   │   │   ├── Progress.jsx         #  Weekly chart + feedback
│   │   │   │   ├── ExerciseHistory.jsx  #  Per-exercise progression
│   │   │   │   ├── Presets.jsx          #  Independent workout presets
│   │   │   │   └── LinkTrainer.jsx      #  Trainer linking form
│   │   │   ├── trainer/
│   │   │   │   ├── Dashboard.jsx        #  Linked trainees + actions
│   │   │   │   ├── Calendar.jsx         #  Schedule with drawer
│   │   │   │   ├── AssignWorkout.jsx    #  Drag-and-drop workout builder
│   │   │   │   ├── AssignDiet.jsx       #  Diet assignment (custom/template)
│   │   │   │   ├── TraineeLogs.jsx      #  Trainee workout log viewer
│   │   │   │   ├── Feedback.jsx         #  Weekly feedback form
│   │   │   │   ├── CoachingHub.jsx      #  Timeline + coaching actions
│   │   │   │   ├── WorkoutTemplates.jsx #  Template CRUD + import
│   │   │   │   ├── DietTemplates.jsx    #  Diet template CRUD + import
│   │   │   │   ├── ExerciseLibrary.jsx  #  Exercise management
│   │   │   │   ├── FoodLibrary.jsx      #  Food item management
│   │   │   │   ├── History.jsx          #  Past assignments
│   │   │   │   ├── Analytics.jsx        #  Trainee performance analytics
│   │   │   │   └── TraineeExerciseHistory.jsx  #  Per-exercise view
│   │   │   └── admin/
│   │   │       ├── Dashboard.jsx        #  System statistics
│   │   │       ├── Users.jsx            #  User management table
│   │   │       ├── Presets.jsx          #  Preset workout CRUD
│   │   │       └── GlobalPresets.jsx    #  Global workout/diet library
│   │   ├── App.jsx                      #  Route definitions
│   │   ├── main.jsx                     #  Entry point
│   │   ├── index.css                    #  Tailwind import + animations
│   │   └── constants.js                 #  Role links config
│   ├── vercel.json                      #  Vercel SPA rewrites
│   └── package.json
│
├── server/                              # Express backend
│   ├── prisma/
│   │   ├── schema.prisma                #  Database schema (17 models)
│   │   ├── seed.js                      #  Main seed script
│   │   ├── demoSeed.js                  #  Rich demo data
│   │   └── migrations/                  #  Migration history
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js                    #  Prisma client via @prisma/adapter-pg
│   │   ├── middleware/
│   │   │   ├── protect.js               #  JWT verification
│   │   │   └── restrictTo.js            #  Role-based access gate
│   │   ├── routes/
│   │   │   ├── authRoutes.js            #  /api/auth/*
│   │   │   ├── traineeRoutes.js         #  /api/trainee/*
│   │   │   ├── trainerRoutes.js         #  /api/trainer/*
│   │   │   ├── adminRoutes.js           #  /api/admin/*
│   │   │   ├── calendarRoutes.js        #  /api/calendar/*
│   │   │   ├── coachingRoutes.js        #  /api/trainer/coaching/*
│   │   │   ├── templateRoutes.js        #  /api/trainer/templates/*
│   │   │   ├── dietTemplateRoutes.js    #  /api/trainer/diet-templates/*
│   │   │   ├── exerciseRoutes.js        #  /api/exercises/*
│   │   │   ├── foodRoutes.js            #  /api/foods/*
│   │   │   ├── exerciseHistoryRoutes.js #  /api/trainee/exercise-history/*
│   │   │   ├── progressRoutes.js        #  /api/progress/*
│   │   │   ├── presetRoutes.js          #  /api/trainee/presets/*
│   │   │   ├── profileRoutes.js         #  /api/profile/*
│   │   │   └── settingsRoutes.js        #  /api/settings/*
│   │   ├── controllers/                 #  Thin HTTP handlers
│   │   │   ├── authController.js
│   │   │   ├── traineeController.js     #  11 handlers
│   │   │   ├── trainerController.js     #  12 handlers
│   │   │   ├── adminController.js       #  7 handlers
│   │   │   ├── (one per service)
│   │   │   └── ...
│   │   ├── services/                    #  Business logic layer
│   │   │   ├── authService.js           #  Register, login, googleAuth, getMe
│   │   │   ├── traineeService.js        #  Link, workouts, diet, feedback
│   │   │   ├── trainerService.js        #  Assign, logs, feedback, analytics, unlink
│   │   │   ├── (one per route group)
│   │   │   └── ...
│   │   └── utils/
│   │       ├── generateTrainerCode.js   #  6-char alphanumeric generator
│   │       └── validatePassword.js      #  Shared password validation
│   ├── server.js                        #  Entry point
│   └── package.json
│
├── docs/
│   ├── PROJECT_SPEC.md                  #  Project specification
│   ├── AUTH_DESIGN.md                   #  Authentication design
│   └── SESSION_SUMMARY.md               #  Development session log
├── README.md                            #  Project README
├── SDD.md                               #  This document
└── AGENTS.md                            #  AI agent context
```

---

## 3. Database Schema

### 3.1 Entity-Relationship Summary

```
User ──1:1──> TrainerProfile
User ──1:1──> TraineeProfile
User ──1:N──> TrainerLink (as trainer)
User ──1:1──> TrainerLink (as trainee)    [unique traineeId]
User ──1:N──> AssignedWorkout (as trainer or trainee)
User ──1:N──> WorkoutLog
User ──1:N──> DietPlan (as trainer or trainee)
User ──1:N──> Feedback (as giver or receiver)
User ──1:N──> CoachingNote (as giver or receiver)
User ──1:N──> ExerciseComment (as giver or receiver)
User ──1:N──> DietComment (as giver or receiver)
User ──1:N──> Exercise
User ──1:N──> FoodItem
User ──1:N──> WorkoutTemplate
User ──1:N──> DietTemplate
PresetWorkout ──1:N──> PresetWorkoutDay ──1:N──> PresetWorkoutExercise
TraineeProfile ──N:1──> PresetWorkout       [selectedPresetId]
```

### 3.2 Model Definitions

**User** — Core identity for all roles.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key, auto-increment |
| name | String | Display name |
| email | String | Unique, used for login |
| password | String? | Null for Google OAuth users |
| role | Role | ADMIN / TRAINER / TRAINEE |
| googleId | String? | Unique, from Google OAuth |
| profileImage | String? | Avatar URL |
| authProvider | AuthProvider | LOCAL or GOOGLE |
| isActive | Boolean | Default true — disabled users cannot authenticate |
| bio, gender, age, height, weight, location | Various | Profile details |
| preferences | Json? | Theme, notification preferences |

Relations: TrainerProfile, TraineeProfile, TrainerLink (trainer/trainee), AssignedWorkout, WorkoutLog, DietPlan, Feedback, CoachingNote, ExerciseComment, DietComment, Exercise, FoodItem, WorkoutTemplate, DietTemplate.

---

**TrainerProfile** — Extended profile for trainer role.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| userId | Int | Unique, FK → User |
| trainerCode | String | Unique, 6-char alphanumeric |
| bio, specialties, yearsExperience | String? | Optional details |

---

**TraineeProfile** — Extended profile for trainee role.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| userId | Int | Unique, FK → User |
| fitnessGoal | String? | e.g. "Build muscle" |
| dateOfBirth | DateTime? | |
| selectedPresetId | Int? | FK → PresetWorkout (optional) |

---

**TrainerLink** — Junction table for trainer–trainee relationship.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User (indexed) |
| traineeId | Int | FK → User, unique (one active trainer per trainee) |
| createdAt | DateTime | |

---

**AssignedWorkout** — Trainer-assigned workout for a specific trainee/day.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User |
| traineeId | Int | FK → User |
| day | DateTime | Date of the workout |
| name | String? | Optional workout name |
| exercises | Json | Array of `{name, sets, reps, weight, rest, tempo, notes}` |

---

**WorkoutLog** — Trainee's actual workout completion record.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| traineeId | Int | FK → User |
| day | DateTime | Date |
| exercises | Json | Trace of assigned exercises |
| progress | Json? | Per-set progress data |
| completed | Boolean | Default false |
| completedAt | DateTime? | Timestamp of completion |
| note | String? | Trainee's notes |

---

**DietPlan** — Trainer-assigned diet plan for a specific trainee/day.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User |
| traineeId | Int | FK → User |
| day | DateTime | Date |
| meals | Json | Array of `{time, items: [string]}` |
| progress | Json? | Per-meal completion tracking |
| completed | Boolean | Default false |
| completedAt | DateTime? | |

---

**Feedback** — Trainer feedback for a trainee.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User |
| traineeId | Int | FK → User |
| weekStart | DateTime? | Week the feedback refers to |
| message | String | Feedback content |
| title, priority, category | String? | Metadata for display |

---

**CoachingNote** — Structured coaching note from trainer to trainee.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User |
| traineeId | Int | FK → User |
| title, message | String | Content |
| priority, category | String? | "high/medium/low", "technique/recovery" |
| read | Boolean | Read status |
| createdAt | DateTime | |

---

**ExerciseComment** — Trainer comment on a specific exercise.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User |
| traineeId | Int | FK → User |
| exerciseName | String | Target exercise |
| comment | String | Coach's note |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| Unique constraint on (trainerId, traineeId, exerciseName) | | |

---

**DietComment** — Trainer comment on a specific meal type.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User |
| traineeId | Int | FK → User |
| mealType | String | e.g. "breakfast", "lunch" |
| comment | String | Coach's note |
| createdAt | DateTime | |
| updatedAt | DateTime | |
| Unique constraint on (trainerId, traineeId, mealType) | | |

---

**Exercise** — Exercise library item (admin/trainer created).
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| name | String | |
| category | String | e.g. "chest", "back", "legs" |
| description, equipment, difficulty | String? | Metadata |
| primaryMuscles, secondaryMuscles | Json? | Muscle group arrays |
| instructions, tips, commonMistakes | String? | Coaching content |
| imageUrl, youtubeUrl | String? | Media references |
| trainerId | Int? | Null = global exercise |

---

**FoodItem** — Food library item (trainer or admin created).
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| name | String | |
| category | String | e.g. "Protein", "Carbs" |
| servingSize | String? | e.g. "100g", "1 cup" |
| calories | Int? | Per serving |
| protein | Float? | Grams per serving |
| carbs | Float? | Grams per serving |
| fat | Float? | Grams per serving |
| imageUrl | String? | Photo reference |
| description | String? | Additional notes |
| trainerId | Int? | Null = global food item |
| createdAt | DateTime | |
| updatedAt | DateTime | |

---

**WorkoutTemplate** — Reusable workout template created by trainer.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User |
| name | String | |
| description, difficulty | String? | |
| estimatedDuration | Int? | Minutes |
| exercises | Json | Array of exercise definitions |
| archived, favorited | Boolean | Status flags |

---

**DietTemplate** — Reusable diet template created by trainer.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| trainerId | Int | FK → User |
| name | String | |
| description | String? | |
| meals | Json | Array of meal definitions |
| archived, favorited | Boolean | Status flags |

---

**GlobalWorkoutPreset** — Admin-created global workout template.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| name | String | |
| description, category, difficulty | String? | |
| tags | Json? | Search tags |
| exercises | Json | Exercise definitions |
| estimatedDuration | Int? | |

---

**GlobalDietPreset** — Admin-created global diet template.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| name | String | |
| description, category, difficulty | String? | |
| tags | Json? | |
| meals | Json | Meal definitions |

---

**PresetWorkout** — Multi-day preset workout program for independent trainees.
| Field | Type | Notes |
|-------|------|-------|
| id | Int | Primary key |
| name | String | e.g. "Beginner Full Body" |
| description | String? | |
| Relations: PresetWorkoutDay[], TraineeProfile[] (selectedPreset) |

**PresetWorkoutDay** — A single day within a preset program.
**PresetWorkoutExercise** — An exercise within a preset day.

---

## 4. User Roles

| Role | Capabilities |
|------|-------------|
| **ADMIN** | System dashboard with user/trainer/trainee counts. User management — view, search, enable/disable accounts (cannot disable self or other admins). Preset workout CRUD. Global workout and diet template CRUD (imported by trainers). |
| **TRAINER** | Create, edit, duplicate, archive, favorite workout templates. Create, edit, duplicate, archive, favorite diet templates. Import global presets into personal templates. Assign workouts to linked trainees (individual or bulk). Assign diet plans (custom mode or from template). Weekly calendar view with workout/diet distribution. Coaching hub with timeline, feedback notes, exercise comments, diet comments. View trainee workout logs and exercise performance history. Analytics dashboard (completion rates, active/inactive trainees). Unlink trainees (deletes assignments, preserves logs). Manage exercise library and food library. |
| **TRAINEE (self-guided)** | Register, browse and select a preset workout program. View daily preset workouts, log completion. View weekly progress chart. Link to a trainer using their 6-character code. |
| **TRAINEE (trainer-linked)** | All self-guided abilities plus: view trainer-assigned workouts and diet plans, track per-set progress (sets, reps, weight), mark workouts/diet plans complete, view trainer feedback and coaching comments, view exercise performance history with charts and personal bests, view trainer's feedback and coaching notes in coaching hub. |

---

## 5. Page List

### 5.1 Public (no auth required)

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Landing | Hero, feature highlights, CTA to register/login |
| `/choose-role` | ChooseRole | Role selection before login/register |
| `/login` | Login | Email/password form + Google OAuth button |
| `/register` | Register | Name, email, password, role toggle, Google OAuth |

### 5.2 Trainee Pages (role: TRAINEE)

| Route | Component | Description |
|-------|-----------|-------------|
| `/trainee/dashboard` | Dashboard | Today's workout, diet, weekly progress, feedback overview |
| `/trainee/calendar` | Calendar | Monthly/weekly view of scheduled workouts and diet plans |
| `/trainee/link-trainer` | LinkTrainer | Enter 6-char trainer code to link |
| `/trainee/presets` | Presets | Browse and select preset workout programs |
| `/trainee/workouts` | Workouts | Track daily workout with per-set progress |
| `/trainee/diet` | Diet | View and track daily diet plan |
| `/trainee/progress` | Progress | Weekly completion chart + trainer feedback |
| `/trainee/exercise-history/:exerciseName` | ExerciseHistory | Per-exercise progression chart, personal bests |

### 5.3 Trainer Pages (role: TRAINER)

| Route | Component | Description |
|-------|-----------|-------------|
| `/trainer/dashboard` | Dashboard | Trainer code, linked trainees, quick actions |
| `/trainer/calendar` | Calendar | Monthly/weekly view with assignment drawer |
| `/trainer/trainees/:id/workout` | AssignWorkout | Drag-and-drop workout builder |
| `/trainer/trainees/:id/diet` | AssignDiet | Custom or template-based diet assignment |
| `/trainer/trainees/:id/logs` | TraineeLogs | View trainee's workout completion history |
| `/trainer/trainees/:id/feedback` | Feedback | Write and view weekly feedback |
| `/trainer/trainees/:id/exercise-history/:exerciseName` | TraineeExerciseHistory | Trainee's per-exercise performance |
| `/trainer/templates` | WorkoutTemplates | Create, manage, import workout templates |
| `/trainer/diet-templates` | DietTemplates | Create, manage, import diet templates |
| `/trainer/exercises` | ExerciseLibrary | Browse and manage exercise library |
| `/trainer/foods` | FoodLibrary | Browse and manage food items |
| `/trainer/coaching` | CoachingHub | Timeline, feedback, comments per trainee |
| `/trainer/history` | History | Browse past assignments with edit/duplicate |
| `/trainer/analytics` | Analytics | Completion metrics, active/inactive trends |

### 5.4 Admin Pages (role: ADMIN)

| Route | Component | Description |
|-------|-----------|-------------|
| `/admin/dashboard` | Dashboard | System statistics (total users, trainers, trainees) |
| `/admin/users` | Users | User table with search, sort, enable/disable |
| `/admin/presets` | Presets | Preset workout CRUD |
| `/admin/global-presets` | GlobalPresets | Global workout and diet template management |

### 5.5 Shared Pages (any authenticated role)

| Route | Component | Description |
|-------|-----------|-------------|
| `/profile` | Profile | View/edit name, email, profile image, personal details |
| `/settings` | Settings | Change password, notification preferences |
| `*` | NotFound | Custom 404 page with role-aware navigation |

---

## 6. API Endpoints

All endpoints return JSON. Protected routes require `Authorization: Bearer <token>`.

### 6.1 Auth

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/auth/register` | No | Register with name, email, password, role (TRAINEE/TRAINER). Generates trainer code for TRAINER role. |
| `POST` | `/api/auth/login` | No | Login with email + password. Returns `{ token, user }`. |
| `POST` | `/api/auth/google` | No | Google OAuth login. Body: `{ credentialToken, role? }`. Creates account or links existing. |
| `GET` | `/api/auth/me` | Yes | Return current authenticated user profile with relations. |

### 6.2 Trainee

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/api/trainee/link-trainer` | Trainee | Link to a trainer. Body: `{ trainerCode }`. |
| `DELETE` | `/api/trainee/link-trainer` | Trainee | Unlink from current trainer. Deletes 7 related models. |
| `GET` | `/api/trainee/workout` | Trainee | Get today's workout (trainer-assigned or preset fallback). |
| `PATCH` | `/api/trainee/workout/exercise/:index/progress` | Trainee | Update exercise progress. Body: `{ exerciseName, setIndex, ... }`. |
| `POST` | `/api/trainee/workout/complete` | Trainee | Mark today's workout complete. |
| `GET` | `/api/trainee/diet` | Trainee | Get today's diet plan (trainer-assigned only). |
| `PATCH` | `/api/trainee/diet/meal/:mealType/progress` | Trainee | Update meal progress. |
| `POST` | `/api/trainee/diet/complete` | Trainee | Mark today's diet complete. |
| `GET` | `/api/trainee/feedback` | Trainee | Get feedback and coaching notes from linked trainer. |
| `GET` | `/api/trainee/presets` | Trainee | List all preset workout programs. |
| `POST` | `/api/trainee/select-preset` | Trainee | Select a preset. |
| `GET` | `/api/trainee/exercise-history/:exerciseName` | Trainee | Per-exercise history with personal bests and progression. |
| `GET` | `/api/trainee/coaching/exercise-comments` | Trainee | Get trainer's exercise comments. |
| `GET` | `/api/trainee/coaching/diet-comments` | Trainee | Get trainer's diet comments. |

### 6.3 Trainer

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/trainer/dashboard` | Trainer | Linked trainees with recent activity, trainer code. |
| `POST` | `/api/trainer/trainees/:id/workout` | Trainer | Assign workout to trainee. Body: `{ day, name, exercises }`. |
| `POST` | `/api/trainer/trainees/:id/diet` | Trainer | Assign diet plan. Body: `{ day, meals }`. |
| `GET` | `/api/trainer/trainees/:id/logs` | Trainer | View trainee's workout logs. |
| `GET` | `/api/trainer/trainees/:id/feedback` | Trainer | Get trainee's feedback. |
| `POST` | `/api/trainer/trainees/:id/feedback` | Trainer | Write weekly feedback. |
| `DELETE` | `/api/trainer/trainees/:id` | Trainer | Unlink trainee (removes assignments, preserves logs). |
| `GET` | `/api/trainer/trainees/:id/exercise-history/:exerciseName` | Trainer | View trainee's per-exercise performance. |
| `POST` | `/api/trainer/bulk/workout` | Trainer | Bulk assign workout to multiple trainees. |
| `POST` | `/api/trainer/bulk/diet` | Trainer | Bulk assign diet plan to multiple trainees. |
| `GET` | `/api/trainer/history/workout` | Trainer | Browse past workout assignments with filters. |
| `GET` | `/api/trainer/history/diet` | Trainer | Browse past diet assignments with filters. |
| `GET` | `/api/trainer/analytics` | Trainer | Completion metrics, active/inactive analysis. |
| `GET` | `/api/trainer/global-presets/workout` | Trainer | List global workout presets available for import. |
| `GET` | `/api/trainer/global-presets/diet` | Trainer | List global diet presets available for import. |

### 6.4 Trainer — Template Management

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/trainer/templates` | Trainer | List workout templates (with filters). |
| `GET` | `/api/trainer/templates/:id` | Trainer | Get single template by ID. |
| `POST` | `/api/trainer/templates` | Trainer | Create workout template. |
| `PUT` | `/api/trainer/templates/:id` | Trainer | Update template. |
| `DELETE` | `/api/trainer/templates/:id` | Trainer | Delete template. |
| `POST` | `/api/trainer/templates/:id/duplicate` | Trainer | Duplicate template. |
| `PATCH` | `/api/trainer/templates/:id/archive` | Trainer | Archive template (soft-delete). |
| `PATCH` | `/api/trainer/templates/:id/restore` | Trainer | Restore archived template. |
| `PATCH` | `/api/trainer/templates/:id/favorite` | Trainer | Toggle favorite. |
| `POST` | `/api/trainer/templates/:id/assign` | Trainer | Assign template to trainees. |
| `POST` | `/api/trainer/templates/import-global/:globalId` | Trainer | Import global workout preset into templates. |
| `GET` | `/api/trainer/diet-templates` | Trainer | List diet templates. |
| `GET` | `/api/trainer/diet-templates/:id` | Trainer | Get single diet template by ID. |
| `POST` | `/api/trainer/diet-templates` | Trainer | Create diet template. |
| `PUT` | `/api/trainer/diet-templates/:id` | Trainer | Update diet template. |
| `DELETE` | `/api/trainer/diet-templates/:id` | Trainer | Delete diet template. |
| `POST` | `/api/trainer/diet-templates/:id/duplicate` | Trainer | Duplicate diet template. |
| `PATCH` | `/api/trainer/diet-templates/:id/archive` | Trainer | Archive diet template (soft-delete). |
| `PATCH` | `/api/trainer/diet-templates/:id/restore` | Trainer | Restore archived diet template. |
| `PATCH` | `/api/trainer/diet-templates/:id/favorite` | Trainer | Toggle favorite. |
| `POST` | `/api/trainer/diet-templates/:id/assign` | Trainer | Assign diet template to trainees. |
| `POST` | `/api/trainer/diet-templates/import-global/:globalId` | Trainer | Import global diet preset into templates. |

### 6.5 Trainer — Coaching

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/trainer/coaching/trainees/:id/timeline` | Trainer | Get activity timeline (feedback, comments, logs). |
| `GET` | `/api/trainer/coaching/trainees/:id/notes` | Trainer | List coaching notes. |
| `POST` | `/api/trainer/coaching/trainees/:id/notes` | Trainer | Create coaching note. |
| `PUT` | `/api/trainer/coaching/trainees/:id/notes/:noteId` | Trainer | Update note. |
| `DELETE` | `/api/trainer/coaching/trainees/:id/notes/:noteId` | Trainer | Delete note. |
| `PATCH` | `/api/trainer/coaching/trainees/:id/notes/:noteId/read` | Trainer | Mark note read/unread. |
| `GET` | `/api/trainer/coaching/trainees/:id/exercise-comments` | Trainer | List exercise comments. |
| `POST` | `/api/trainer/coaching/trainees/:id/exercise-comments` | Trainer | Create or update exercise comment. |
| `DELETE` | `/api/trainer/coaching/trainees/:id/exercise-comments/:commentId` | Trainer | Delete exercise comment. |
| `GET` | `/api/trainer/coaching/trainees/:id/diet-comments` | Trainer | List diet comments. |
| `POST` | `/api/trainer/coaching/trainees/:id/diet-comments` | Trainer | Create or update diet comment. |
| `DELETE` | `/api/trainer/coaching/trainees/:id/diet-comments/:commentId` | Trainer | Delete diet comment. |

### 6.6 Exercise & Food Library

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/exercises` | Any (auth) | List exercises (with search, category, difficulty filters). |
| `GET` | `/api/exercises/:id` | Any (auth) | Get single exercise. |
| `POST` | `/api/exercises` | Trainer/Admin | Create exercise. |
| `PUT` | `/api/exercises/:id` | Trainer/Admin | Update exercise. |
| `DELETE` | `/api/exercises/:id` | Trainer/Admin | Delete exercise. |
| `GET` | `/api/foods` | Any (auth) | List food items (with search, category filters). |
| `GET` | `/api/foods/:id` | Any (auth) | Get single food item. |
| `POST` | `/api/foods` | Trainer | Create food item. |
| `PUT` | `/api/foods/:id` | Trainer | Update food item. |
| `DELETE` | `/api/foods/:id` | Trainer | Delete food item. |

### 6.7 Calendar

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/calendar/trainer` | Trainer | Get monthly events with per-day workout/diet counts. |
| `GET` | `/api/calendar/trainee` | Trainee | Get monthly events with status details. |
| `GET` | `/api/calendar/trainee/upcoming` | Trainee | Get upcoming scheduled workouts. |

### 6.8 Progress

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/progress/weekly` | Trainee | Get weekly completion data with days/completion rate. |

### 6.9 Profile & Settings

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/profile` | Any | Get own profile. |
| `PATCH` | `/api/profile` | Any | Update profile. |
| `POST` | `/api/profile/avatar` | Any | Upload avatar image. |
| `PATCH` | `/api/settings/password` | Any | Change password (validates same rules as registration). |
| `GET` | `/api/settings/preferences` | Any | Get preferences. |
| `PATCH` | `/api/settings/preferences` | Any | Update preferences. |

### 6.10 Admin

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `GET` | `/api/admin/dashboard` | Admin | System statistics. |
| `GET` | `/api/admin/users` | Admin | List all users. |
| `PATCH` | `/api/admin/users/:id/toggle-status` | Admin | Enable/disable user (guards against self-disable). |
| `GET` | `/api/admin/presets` | Admin | List preset workouts. |
| `POST` | `/api/admin/presets` | Admin | Create preset workout. |
| `PUT` | `/api/admin/presets/:id` | Admin | Update preset workout. |
| `DELETE` | `/api/admin/presets/:id` | Admin | Delete preset workout. |
| `GET` | `/api/admin/global-presets/workout` | Admin | List global workout presets. |
| `POST` | `/api/admin/global-presets/workout` | Admin | Create global workout preset. |
| `PUT` | `/api/admin/global-presets/workout/:id` | Admin | Update global workout preset. |
| `DELETE` | `/api/admin/global-presets/workout/:id` | Admin | Delete global workout preset. |
| `GET` | `/api/admin/global-presets/diet` | Admin | List global diet presets. |
| `POST` | `/api/admin/global-presets/diet` | Admin | Create global diet preset. |
| `PUT` | `/api/admin/global-presets/diet/:id` | Admin | Update global diet preset. |
| `DELETE` | `/api/admin/global-presets/diet/:id` | Admin | Delete global diet preset. |

---

## 7. User Flows

### 7.1 Trainee — Self-Guided

```
Landing → Register (role: TRAINEE) → Login → Dashboard (welcome card)
                                                    ↓
                                    Browse Presets → Select Preset
                                                    ↓
                                    Daily: Workouts page → Track sets → Complete
                                                    ↓
                                    Progress page → View weekly chart
                                    Calendar → View schedule
```

### 7.2 Trainee — Trainer-Linked

```
Landing → Register → Login → Dashboard (linked view)
                                    ↓
                    Link Trainer (enter 6-char code)
                                    ↓
            Dashboard shows: today's workout, diet plan, progress, feedback
                                    ↓
            Workouts → Track per-set progress (sets, reps, weight) → Complete
            Diet → Mark meals complete → Complete
            Progress → View completion chart + trainer feedback
            Calendar → View scheduled workouts/diet plans
            Exercise History → Per-exercise charts with personal bests
                                    ↓
            Unlink (optional) → clears assignments, preserves logs, returns to independent state
```

### 7.3 Trainer — Coaching Flow

```
Register (role: TRAINER) → Login → Dashboard (shows trainer code)
                                        ↓
                    Share code with trainees → they link
                                        ↓
            Dashboard → View linked trainees with last-log badges
                                        ↓
            Select trainee:
            ├── Assign Workout → Exercise picker → DnD builder → Preview → Save
            ├── Assign Diet → Custom mode or Use Template → Save
            ├── Calendar → View month → Click day → Assign from drawer
            ├── Coaching Hub → Timeline → Send feedback / Exercise comment / Diet comment
            ├── Trainee Logs → View completion history
            └── Exercise History → Per-exercise performance with charts
                                        ↓
            Templates → Create reusable templates → Import from global library
            Exercise Library → Manage custom exercises
            Food Library → Manage food items
            History → Browse past assignments → Edit & Reassign / Duplicate
            Analytics → Completion rates, active trainee trends
                                        ↓
            Unlink trainee → deletes assignments, coaching data; preserves logs
```

### 7.4 Admin Flow

```
Login (admin seed account) → Admin Dashboard (system stats)
                                    ↓
            Users → View table → Search → Toggle enable/disable
                    (cannot disable self or other admins)
                                    ↓
            Presets → Create/edit/delete preset workout programs
                                    ↓
            Global Presets → Create/edit/delete global workout templates
                           → Create/edit/delete global diet templates
```

### 7.5 Template Import Flow

```
Trainer Template Library
    ↓
"Import from Global Library" button → GlobalImportModal opens
    ↓
Search global presets (by name, description, difficulty, category)
    ↓
Select → Copies exercises/metadata into trainer's personal template
    ↓
Trainer can further edit, assign, or favorite
```

### 7.6 Calendar Assignment Flow

```
Trainer Calendar (month view)
    ↓
Click day → Shows workout count + diet count
    ↓
Open drawer → Click "Assign" button
    ↓
Select template → Choose trainees → Select day → Preview → Confirm
    ↓
Calendar updates with new assignment
```

### 7.7 Unlink Flows

```
TRAINER: Dashboard → Trainee card → "Remove" button → ConfirmDialog → Confirm
    ↓
Backend transaction:
    Deletes: TrainerLink, AssignedWorkout, DietPlan, Feedback,
             CoachingNote, ExerciseComment, DietComment
    Preserves: WorkoutLog, User, TraineeProfile

TRAINEE: Dashboard → "Leave Trainer" button → ConfirmDialog → Confirm
    ↓
Same backend transaction as trainer unlink
    AuthContext refreshed immediately → dashboard shows independent view
```

---

## 8. Implementation Status

| Feature | Status | Notes |
|---------|--------|-------|
| User registration (email + password) | Completed | Single /register with role toggle |
| User login | Completed | With JWT 24h expiry |
| Google OAuth | Completed | Both login and registration |
| JWT protect middleware | Completed | |
| Role-based restrictTo middleware | Completed | |
| Trainer code generation | Completed | 6-char alphanumeric |
| Trainer-trainee linking | Completed | Via TrainerLink junction table |
| Trainee unlink | Completed | Deletes 7 models, preserves logs |
| Trainer unlink | Completed | Same transaction as trainee unlink |
| Preset workout system | Completed | CRUD + trainee selection |
| Workout templates | Completed | Full CRUD, duplicate, archive, favorite, import |
| Diet templates | Completed | Full CRUD, duplicate, archive, favorite, import |
| Global workout presets (admin) | Completed | CRUD + trainer import |
| Global diet presets (admin) | Completed | CRUD + trainer import |
| Assign workout (single) | Completed | DnD exercise builder |
| Assign diet (single) | Completed | Custom + template mode |
| Bulk assign workout | Completed | Via BulkAssignModal |
| Bulk assign diet | Completed | (one runtime bug fixed in audit) |
| Workout tracking | Completed | Per-set sets/reps/weight with autosave |
| Diet tracking | Completed | Per-meal completion |
| Weekly progress | Completed | Bar chart + completion rate |
| Calendar (trainer) | Completed | Month/week/day with assignment drawer |
| Calendar (trainee) | Completed | Month/week/day with status dots |
| Exercise history (trainee) | Completed | Per-exercise chart, personal bests |
| Exercise history (trainer view) | Completed | Linked from History page |
| Coaching hub | Completed | Timeline, feedback, comments |
| Feedback system | Completed | Write/view per trainee |
| Exercise comments | Completed | Per-exercise coach notes |
| Diet comments | Completed | Per-meal coach notes |
| Exercise library | Completed | CRUD with search/filters |
| Food library | Completed | CRUD with search/filters |
| Analytics dashboard | Completed | Completion rates, active trends |
| History browsing | Completed | Past assignments with edit/duplicate |
| Admin user management | Completed | Search, sort, toggle status (self-disable guarded) |
| Admin global presets | Completed | Workout + diet template management |
| Profile management | Completed | View/edit personal details, avatar upload |
| Settings | Completed | Change password (validated), preferences |
| Password policy | Completed | Min 8 chars, uppercase, lowercase, number |
| Caps lock detection | Completed | On login and register forms |
| Show/hide password | Completed | On login and register forms |
| Responsive design | Completed | Mobile sidebar, responsive grids, scrollable week view |
| Loading states | Completed | Skeleton screens on all data-fetching pages |
| Empty states | Completed | Contextual messages on all list pages |
| Error handling | Completed | Toast notifications, inline error states |
| Unlink AuthContext refresh | Completed | FetchMe called after unlink |
| CORS production config | Completed | Allowlist-based with FRONTEND_URL env |
| Seed data | Completed | 13 accounts, 3 presets, 20 global presets, 190+ exercises, 27 foods |
| Demo seed data | Completed | Rich profiles, 10-week history, coaching notes, comments |

---

## Deployment Strategy ($0 Budget)

| Layer | Service | Notes |
|-------|---------|-------|
| Frontend (static) | Vercel (free tier) | SPA rewrites configured in vercel.json |
| Backend (Node) | Render.com (free tier) | Build: `npm install && prisma generate && prisma migrate deploy && seed` |
| Database | Neon.tech (PostgreSQL free tier) | 0.5 GB storage |
| Source code | GitHub (private repo) | |

Environment variables: `DATABASE_URL`, `JWT_SECRET`, `GOOGLE_CLIENT_ID`, `FRONTEND_URL`.

---

*This document reflects the implemented system as of July 2026. Built with React 19/Vite 8, Express 5, Prisma 7, and PostgreSQL. Submitted as a partial fulfillment of the B.Sc. CSIT degree.*
