# La Traino — Frontend

Frontend for La Traino, a personalised physical training system connecting trainers and trainees.

Built with React 19, Vite 8, Tailwind CSS 4, and React Router 7.

## Installation

```bash
npm install
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values:

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g. `https://your-api.onrender.com/api`) |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |

## Development

```bash
npm run dev
```

Starts the Vite dev server on port 5173.

## Production Build

```bash
npm run build
```

Output is written to `dist/`.

## Preview Build

```bash
npm run preview
```

Serves the production build locally.

## Deployment Instructions (Vercel)

1. Connect your GitHub repository to Vercel.
2. Set the framework preset to **Vite**.
3. Set the build command to `npm run build`.
4. Set the output directory to `dist`.
5. Add the following environment variables in the Vercel dashboard:

   - `VITE_API_URL` — your Render backend URL (e.g. `https://your-api.onrender.com/api`)
   - `VITE_GOOGLE_CLIENT_ID` — your Google OAuth client ID

6. Deploy. No additional configuration required.
