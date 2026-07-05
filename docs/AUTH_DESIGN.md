# Authentication Design — La Traino

---

## 1. Authentication Flows

### 1.1 Email Registration

```
Client                         Server
  │                              │
  │  POST /api/auth/register     │
  │  { name, email, password,    │
  │    role }                    │
  │ ──────────────────────────►  │
  │                              │ Validate inputs
  │                              │ Check email uniqueness
  │                              │ Hash password (bcrypt, 10 rounds)
  │                              │ Create User with chosen role
  │                              │ If role is TRAINER → generate trainer code
  │                              │ Generate JWT { userId, role }
  │  ◄────────────────────────── │
  │  { token, user }             │
```

- Role is chosen by the user on the registration form. Accepted values: `TRAINEE` or `TRAINER`.
- If the role is `TRAINER`, the server generates a unique 6-char alphanumeric trainer code during account creation.

### 1.2 Email Login

```
Client                         Server
  │                              │
  │  POST /api/auth/login        │
  │  { email, password }         │
  │ ──────────────────────────►  │
  │                              │ Find user by email
  │                              │ Compare password with bcrypt
  │                              │ Generate JWT { userId, role }
  │  ◄────────────────────────── │
  │  { token, user }             │
```

- Error messages: "Invalid email or password" (no hint about which field is wrong).

### 1.3 Google OAuth Login

```
Client                         Server
  │                              │
  │  User clicks "Sign in with   │
  │  Google" button              │
  │  │                           │
  │  Google One Tap / popup      │
  │  returns credential token    │
  │  │                           │
  │  POST /api/auth/google       │
  │  { credentialToken, role? }  │
  │ ──────────────────────────►  │
  │                              │ Verify token with google-auth-library
  │                              │ Extract { email, name, sub (googleId) }
  │                              │
  │                              │ if googleId exists → log in
  │                              │ if email exists but no googleId →
  │                              │   link googleId to existing account
  │                              │ if neither exists → create User
  │                              │   with chosen role (TRAINEE / TRAINER)
  │                              │   If role is TRAINER → generate trainer code
  │                              │
  │                              │ Generate JWT { userId, role }
  │  ◄────────────────────────── │
  │  { token, user }             │
```

- Google-registered users have `authProvider: "google"`. They have no password set in the database.
- If a Google user later wants to set a password (future feature), they can use a "Set Password" flow.

### 1.4 Logout

- Logout is **client-side only**. The frontend removes the stored JWT.
- No server-side token blacklist (MVP simplicity).
- If token invalidation is needed later, a token version field on the User model can be added.

---

## 2. JWT Strategy

| Property | Value |
|---|---|
| **Storage** | `localStorage` on the browser. Sent via `Authorization: Bearer <token>` header. |
| **Payload** | `{ userId: number, role: "ADMIN" | "TRAINER" | "TRAINEE", iat, exp }` |
| **Expiration** | 24 hours from generation. |
| **Refresh strategy** | None for MVP. The 24-hour expiry is sufficient for a college project. If the token expires, the user must log in again. A refresh token mechanism can be added later if needed. |
| **Secret** | `JWT_SECRET` environment variable. Must be a random string of at least 32 characters. |

**Why localStorage instead of httpOnly cookies:**
- Simpler to implement with a decoupled frontend/backend.
- No CSRF protection needed.
- Works seamlessly with Vercel (frontend) and Render (backend) on different domains.
- Trade-off: vulnerable to XSS. Mitigated by keeping the codebase small and audited (college project scale).

---

## 3. User Roles

| Role | Enum Value | Description |
|---|---|---|
| Admin | `ADMIN` | Manages users and preset workouts. Created via database seed only. |
| Trainer | `TRAINER` | Registers, gets a unique trainer code, manages linked trainees, assigns plans. |
| Trainee | `TRAINEE` | Default role on registration. Self-guided or trainer-linked. |

- The role is set at registration and never changes through the UI (admin can promote/demote, but this is out of MVP scope).
- The role is stored in the JWT payload to avoid a database lookup on every request for role-checking.

---

## 4. Route Protection Strategy

### 4.1 Route Categories

| Category | Access | Examples |
|---|---|---|
| **Public** | No auth required | Landing, Login, Register |
| **Protected** | Any authenticated user | None in this MVP — every protected route is role-specific |
| **Trainee-only** | Authenticated + role TRAINEE | /trainee/* |
| **Trainer-only** | Authenticated + role TRAINER | /trainer/* |
| **Admin-only** | Authenticated + role ADMIN | /admin/* |

### 4.2 Backend Middleware Chain

```
Request
  │
  ▼
protect middleware
  ├─ No token / invalid    → 401 Unauthorized
  ├─ Expired token         → 401 Unauthorized
  └─ Valid token           → req.user = { userId, role }
                              │
                              ▼
                   restrictTo("TRAINER") middleware
                              │
                    ├─ Wrong role  → 403 Forbidden
                    └─ Correct role → route handler
```

- `protect.js` — Decodes JWT, attaches `req.user`.
- `restrictTo(...roles)` — Checks `req.user.role` against allowed roles.

### 4.3 Frontend Route Guards

- `ProtectedRoute` component wraps role-specific pages.
- Checks auth state (from AuthContext/AuthProvider).
- If not authenticated, redirects to `/login`.
- If wrong role, redirects to the user's own dashboard or shows a 403 page.
- Uses React Router's `<Navigate>` for redirects.

---

## 5. Password Hashing

- Library: `bcryptjs` (pure JavaScript, no native compilation issues).
- Salt rounds: 10 (standard balance of security and speed).
- Only email-registered users have a password hash in the database.
- Google OAuth users have `password` set to `NULL` (nullable field).
- Passwords are never returned in API responses — the `password` field is excluded from the Prisma query via `select` or `omit`.

---

## 6. Google OAuth Flow (Detailed)

### Frontend

1. Load the Google Identity Services library via a `<script>` tag in `index.html` or dynamically.
2. Render a "Sign in with Google" button using `google.accounts.id.renderButton()`.
3. On success, `google.accounts.id.initialize()` callback receives a `credential` (JWT token from Google).
4. Send this credential to `POST /api/auth/google`.

### Backend

1. Verify the credential token using `google-auth-library`:
   - Check the `aud` field matches `GOOGLE_CLIENT_ID`.
   - Extract `email`, `name`, `sub` (Google user ID).
2. Database logic:
   - Look up user by `googleId`.
   - If found → log them in.
   - If not found but email exists → link the Google account (set `googleId` and `authProvider`).
   - If neither exists → create new user with chosen `role` (sent from frontend), `authProvider: "google"`, no password. If role is `TRAINER`, generate trainer code.
3. Issue application JWT and return `{ token, user }`.

### Prisma User Model Fields for Google OAuth

```
googleId      String?   @unique
authProvider  String    @default("local")   // "local" | "google"
```

---

## 7. Folder Structure for Authentication

```
client/src/
├── api/
│   └── auth.js                  # login(), register(), googleLogin(), fetchMe()
├── context/
│   └── AuthContext.jsx           # createContext, AuthProvider, useAuth hook
├── components/
│   └── ProtectedRoute.jsx        # Route guard based on auth + role
├── pages/auth/
│   ├── Login.jsx                 # Email login + Google button
│   └── Register.jsx              # Registration with role selector + Google button

server/src/
├── middleware/
│   ├── protect.js                # JWT verification
│   └── restrictTo.js             # Role-based gate
├── services/
│   └── authService.js            # Registration, login, google auth logic
├── controllers/
│   └── authController.js         # Thin handlers that call authService
├── routes/
│   └── authRoutes.js             # POST /register, /login, /google, GET /me
└── utils/
    └── generateTrainerCode.js    # 6-char alphanumeric code
```

---

## 8. Backend API List (Names Only)

| Method | Path | Auth | Role | Purpose |
|---|---|---|---|---|
| POST | /api/auth/register | No | — | Register with email (role: TRAINEE or TRAINER) |
| POST | /api/auth/login | No | — | Email/password login |
| POST | /api/auth/google | No | — | Google OAuth login (optional role for new users) |
| GET | /api/auth/me | Yes | Any | Get current user profile |

---

## 9. Frontend Pages Involved

| Page | Route | Auth Required | Purpose |
|---|---|---|---|
| Landing | `/` | No | Public landing with CTA to login/register |
| Login | `/login` | No | Email/password form and Google button |
| Register | `/register` | No | Name, email, password, role selector (Trainee / Trainer), Google button |

---

## 10. Security Considerations (College MVP)

| Concern | Mitigation |
|---|---|
| **Password storage** | bcrypt with 10 salt rounds. Never log or return passwords. |
| **JWT secret** | Strong random string stored in `.env`. Never committed to git. |
| **XSS** | No user-generated HTML rendered. React's JSX auto-escapes. |
| **CSRF** | Not applicable — JWT in Authorization header, not cookies. |
| **Brute force login** | Not mitigated for MVP. A simple rate-limiter (`express-rate-limit`) can be added later. |
| **Token theft (XSS)** | JWT stored in localStorage — vulnerable if XSS is present. Acceptable for college MVP scope. For production, httpOnly cookies would be used. |
| **HTTPS** | Handled by Vercel (frontend) and Render (backend) — both provide free TLS. |
| **Google token verification** | Server-side verification using Google's official library. Never trust the frontend-only verification. |
| **Email uniqueness** | Unique constraint in database. Checked before registration. |
| **Input validation** | Basic validation on the server (email format, password length ≥ 6, name required). |

---

*This design follows the approved proposal and AI_RULES.md. All choices assume a $0 budget and college-project scale.*
