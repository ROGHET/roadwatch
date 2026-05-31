# RoadWatch Technology Stack

Verified from repository `package.json` files and source imports (May 2026).

## Frontend

| Layer | Technology | Version (package.json) |
|-------|------------|-------------------------|
| Runtime | React | ^19.2.6 |
| Language | TypeScript | ~6.0.2 |
| Build | Vite | ^8.0.12 |
| Routing | react-router-dom | ^7.16.0 |
| Styling | Tailwind CSS | ^4.3.0 (`@tailwindcss/vite`) |
| State | Zustand (+ persist middleware) | ^5.0.14 |
| Server state | TanStack React Query | ^5.100.14 |
| Forms | react-hook-form + Zod + `@hookform/resolvers` | ^7.76.1 / ^4.4.3 |
| HTTP | Axios | ^1.16.1 |
| Maps | Leaflet, react-leaflet, leaflet.markercluster, react-leaflet-cluster | ^1.9.4 / ^5.0.0 |
| Charts | Recharts | ^3.8.1 |
| Motion | Framer Motion | ^12.40.0 |
| i18n | i18next, react-i18next | ^26.3.0 / ^17.0.8 |
| Icons | lucide-react | ^1.17.0 |
| Toasts | Sonner | ^2.0.7 |
| Utilities | clsx, tailwind-merge, class-variance-authority | — |

## Backend

| Layer | Technology | Version |
|-------|------------|---------|
| Runtime | Node.js (TypeScript via ts-node) | — |
| Framework | Express | ^4.19.2 |
| ORM | Prisma | ^5.0.0 |
| Auth | jsonwebtoken, bcrypt | ^9.0.2 / ^5.1.1 |
| Validation | Zod | ^3.23.8 |
| CORS | cors | ^2.8.5 |
| Config | dotenv | ^16.4.5 |

## Database

- **PostgreSQL** (via Prisma schema in `backend/prisma/`)

## Maps & GIS

- **Leaflet** map renderer with Carto/OSM tile layers
- **OpenStreetMap** road network (GeoJSON / PBF datasets under `datasets/`)
- **Nominatim** place search (`frontend/src/lib/map/nominatimSearch.ts`)
- Client-side geo indexing (`frontend/src/lib/gis/`)

## AI

- **Google Gemini** (`@google/genai` in backend `backend/src/routes/ai.ts`)
- Legacy `@google/generative-ai` also listed in backend dependencies

## External data APIs (frontend providers)

- **Open-Meteo** — weather (`frontend/src/lib/map/providers/weatherProviders.ts`)
- **Open-Meteo / WAQI-style** — AQI (`aqiProviders.ts`)
- **Traffic** — pluggable providers (`trafficProviders.ts`)
- **OSRM** — route preview (`frontend/src/lib/map/providers/`)

## Hosting targets

- **Frontend**: static Vite `dist/` (documented in `DEPLOYMENT.md` if present)
- **Backend**: Node/Express process with `DATABASE_URL`
- Large GeoJSON (>65 MB) excluded from Vite bundle; intended for CDN/external hosting

## Project layout

```
roadwatch/
├── frontend/     # React SPA
├── backend/      # Express + Prisma API
├── datasets/     # CSV, GeoJSON, JSON sources
└── docs/         # Documentation
```
