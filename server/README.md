# La Traino — Backend API

Backend API for La Traino, a personalised physical training system connecting trainers and trainees.

Built with Node.js, Express 5, Prisma 7, and PostgreSQL.

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `FRONTEND_URL` | Frontend origin for CORS (e.g. `https://your-app.vercel.app`) |
| `PORT` | Server port (default: 5000) |

## Prisma Migration

Generate the Prisma client:

```bash
npm run prisma:generate
```

Run migrations:

```bash
# Development (interactive)
npm run prisma:migrate

# Production (non-interactive)
npm run prisma:migrate:deploy
```

## Seed

```bash
npm run seed
```

## Development

```bash
npm run dev
```

Starts the server with nodemon on port 5000.

## Production Start

```bash
npm start
```

## Deployment Notes (Render)

1. Set the build command: `npm install && npx prisma generate && npx prisma migrate deploy && npm run seed`
2. Set the start command: `npm start`
3. Add all environment variables from `.env.example` in the Render dashboard.
4. Set `FRONTEND_URL` to your Vercel deployment URL.
5. Use a Neon PostgreSQL database for the `DATABASE_URL`.

The health check endpoint is available at `/api/health`.
