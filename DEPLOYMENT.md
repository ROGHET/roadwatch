# CrashZero / RoadWatch — Production Deployment

## Prerequisites

- Node.js 20+
- PostgreSQL (Supabase project or self-hosted)
- Static hosting for the Vite frontend (Vercel, Netlify, Cloudflare Pages, or nginx)

## 1. Environment variables

### Frontend (`frontend/.env`)

Copy `frontend/.env.example` and set:

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_OPENWEATHER_API_KEY` | No | OpenWeather API key for live weather, alerts-derived flood risk |
| `VITE_MAP_WEATHER_PROVIDER` | No | `openweather` or `open-meteo` (default: Open-Meteo if no key) |
| `VITE_API_BASE_URL` | Yes (for complaints API) | Backend URL, e.g. `https://api.yourdomain.com` |

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/postgres?sslmode=require
JWT_SECRET=your-long-random-secret
PORT=4000
```

Use the **Supabase** connection string from Project Settings → Database (URI, with `?pgbouncer=true` for serverless if needed).

## 2. Database (Supabase PostgreSQL)

1. Create a Supabase project.
2. Set `DATABASE_URL` in `backend/.env` to the Supabase Postgres URI.
3. From `backend/`:

```bash
npm install
npx prisma migrate deploy
npm run db:seed
```

Seed creates demo users and authority rows. Complaint and road intelligence data are loaded from `/datasets` in the frontend build.

## 3. Build frontend

Datasets under `datasets/` are copied into `frontend/dist/datasets` at build time and served at `/datasets/*`.

```bash
cd frontend
npm install
npm run build
```

Deploy the `frontend/dist` folder. Ensure `/datasets/export.geojson` and other large files are included (the Vite plugin copies all files from `datasets/`).

## 4. Run backend

```bash
cd backend
npm install
npm run build
npm start
```

Or use a process manager (PM2, Railway, Render) with `DATABASE_URL` and `JWT_SECRET` set.

## 5. Production checklist

- [ ] `DATABASE_URL` points to Supabase PostgreSQL
- [ ] Prisma migrations applied (`migrate deploy`)
- [ ] `frontend/dist/datasets/` contains GeoJSON, CSV, JSON sources
- [ ] `VITE_API_BASE_URL` matches deployed backend
- [ ] HTTPS enabled (required for geolocation)
- [ ] OpenWeather key set if you want OpenWeather instead of Open-Meteo
- [ ] CORS on backend allows your frontend origin

## 6. Local development

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend (serves /datasets from repo)
cd frontend && npm run dev
```

Frontend dev server exposes `http://localhost:5173/datasets/...` via the Vite datasets plugin.

## 7. Data refresh

Replace files in `datasets/` and rebuild the frontend. No code change is required for CSV/JSON updates. Re-run `npm run build` so `dist/datasets` is refreshed.
