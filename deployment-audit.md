# RoadWatch Deployment Audit

Generated: 2026-05-31

This audit covers dataset sizes, load strategy, and free-tier hosting constraints for Vercel / Netlify.

## JS bundle (startup)

| Asset | Size (gzip) | Loaded at startup? |
|-------|-------------|-------------------|
| `index-*.js` (main app + CSV/JSON via `?raw`) | ~2.9 MB gzip | Yes |
| `RoadWatchMapView-*.js` (map chunk) | ~82 KB gzip | Lazy (route) |
| Road GeoJSON in bundle | **None** | No — fetched from `/datasets/*` |

Road GeoJSON is **never** imported into the JS bundle. All road layers use `fetch('/datasets/...')`.

## Road GeoJSON — lazy loading

Managed by `frontend/src/lib/gis/roadDatasetManager.ts`. Files load when the map viewport intersects the region bbox (debounced 350ms). Only one regional file loads at a time to limit memory spikes.

| Dataset | Size | Startup | Lazy trigger |
|---------|------|---------|--------------|
| `export.geojson` | 4.6 MB | **Yes** (Mumbai corridor) | Always on map open |
| `Maharashtra export.geojson` | 102.4 MB | No | Viewport enters Maharashtra bbox, zoom ≥ 6 |
| `Madhya Pradesh.geojson` | 64.6 MB | No | Viewport enters MP bbox, zoom ≥ 6 |
| `A.geojson` | 187.2 MB | No | Viewport intersects zone A, zoom ≥ 7 |
| `B.geojson` | 88.8 MB | No | Viewport intersects zone B, zoom ≥ 7 |
| `C.geojson` | 139.3 MB | No | Viewport intersects zone C, zoom ≥ 7 |
| `D.geojson` | 131.6 MB | No | Viewport intersects zone D, zoom ≥ 7 |
| `E.geojson` | 90.6 MB | No | Viewport intersects zone E, zoom ≥ 7 |
| `F.geojson` | 112.4 MB | No | Viewport intersects zone F, zoom ≥ 7 |

## Removed from map (performance)

| Dataset | Size | Loaded at startup? | Notes |
|---------|------|-------------------|-------|
| `india_state.geojson.txt` | 21.9 MB | **No** | State outline layer removed entirely |

## Static assets copied to `dist/datasets/` (production build)

Build plugin skips:

- `*.pbf` OSM extracts (~2.3 GB total)
- `*.png` preview images
- `india-osm.geojson.txt`, `india_state.geojson.txt`
- Any single file **> 65 MB** (host externally for full regional coverage)

With the 65 MB cap, typical deploy includes:

- `export.geojson`, `Madhya Pradesh.geojson`
- CSV / JSON analytics sources (ADSI, CRIF, tolls, BMC, etc.)

Estimated deployed static datasets: **~85 MB** (fits Vercel / Netlify free limits).

Files **not** copied (require CDN / object storage for production full coverage):

- `A.geojson` through `F.geojson`
- `Maharashtra export.geojson`
- `B.geojson`, `E.geojson` (also > 65 MB individually in some builds)

## Bundled data (CSV / JSON via Vite `?raw`)

| Dataset | ~Size | Loaded at startup? |
|---------|-------|-------------------|
| `ADSI_Table_1A.2.csv` | 10 KB | Yes (risk hotspots) |
| `tolls-latest.json` + NHAI CSV | 2.4 MB | Yes (toll markers) |
| `roadwatch_bmc_4010.json` | 80 KB | Yes |
| RS session CSVs | ~30 KB | Yes |
| `contract_awards_*.csv` | 12.9 MB | Yes (if imported) |

## Dev server

All files under `datasets/` are served at `/datasets/*` via Vite middleware (no size filter in dev). Lazy loader works the same; large files load only when the viewport enters their region.

## Recommendations for full India road coverage on free tier

1. Host zone GeoJSON (`A.geojson`–`F.geojson`, `Maharashtra export.geojson`) on S3 / R2 / GitHub Releases.
2. Point `datasetUrl()` base to that CDN via env var (future enhancement).
3. Keep startup payload to `export.geojson` + analytics CSVs only.

## Performance changes in this pass

- Removed state boundary GeoJSON layer (~22 MB fetch + render cost)
- Viewport-based road dataset manager (sequential loads, deduped feature index)
- `React.memo` / `useMemo` / `useCallback` on map layers
- Cluster click zoom via `MapClusterZoomHandler` attached to each `MarkerClusterGroup`
- Toll plaza custom icons + layer legend toggles
