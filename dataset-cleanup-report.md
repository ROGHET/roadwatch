# Dataset Cleanup Report

**Repository:** `F:\Hackathon\roadwatch\datasets`  
**Generated:** 2026-05-31  
**Total files:** 37 | **Total size:** ~3.3 GB  

**Policy:** This report is analysis only. No files were deleted, moved, or archived.

---

## Executive summary

| Category | Count | Total size |
|----------|------:|------------|
| Files > 50 MB | 11 | ~3.28 GB |
| Used in UI (bundle and/or runtime fetch) | 22 | varies |
| Used in backend | 0 | — |
| Likely safe to delete (app-only) | 15+ | ~2.4 GB (mostly PBF + unused assets) |
| Duplicate datasets | 4 groups | see below |

---

## Per-file inventory

| Filename | Size | Imported by | UI | Backend | Safe to delete? |
|----------|------|-------------|-----|---------|-----------------|
| `A.geojson` | 187.2 MB | `frontend/src/lib/gis/roadDatasetManager.ts` | Yes (lazy fetch, zoom ≥ 10) | No | No |
| `ADSI_Table_1A.2.csv` | 5.5 KB | `frontend/src/data/realDatasets.ts` | Yes (bundled) | No | No |
| `audit.py` | 1.3 KB | — (tooling only) | No | No | Yes* |
| `B.geojson` | 88.8 MB | `roadDatasetManager.ts` | Yes (lazy fetch) | No | No |
| `C.geojson` | 139.3 MB | `roadDatasetManager.ts` | Yes (lazy fetch) | No | No |
| `cities.json` | 110 KB | — (`DATASET_INVENTORY.md` only) | No | No | Yes |
| `cities2.json` | 110 KB | — | No | No | Yes (duplicate of `cities.json`) |
| `column_details_contract_awards_…05-31-2026.xlsx` | 8.1 KB | — | No | No | Yes |
| `contract_awards_…05-31-2026.csv` | 12.9 MB | `frontend/src/data/contractAwards.ts` | Yes (bundled) | No | No |
| `D.geojson` | 131.6 MB | `roadDatasetManager.ts` | Yes (lazy fetch) | No | No |
| `E.geojson` | 90.6 MB | `roadDatasetManager.ts` | Yes (lazy fetch) | No | No |
| `export.geojson` | 4.6 MB | `roadDatasetManager.ts` (startup region) | Yes (lazy fetch) | No | No |
| `export.png` | 0.88 MB | — | No | No | Yes |
| `F.geojson` | 112.4 MB | `roadDatasetManager.ts` | Yes (lazy fetch) | No | No |
| `hways_statehighways_0.csv` | 27.5 KB | `realDatasets.ts` | Yes (bundled) | No | No |
| `india_state.geojson.txt` | 21.9 MB | `stateBoundaries.ts` (orphaned — not imported) | No | No | Yes† |
| `India_surface-quality.geojson` | 246 B | — | No | No | Yes (empty FeatureCollection) |
| `india-260529.osm.pbf` | 1601 MB | — (source archive) | No | No | Yes‡ |
| `india-osm.geojson.txt` | 6.3 MB | — | No | No | Yes |
| `india-tollplaza-data-nhai.csv` | 37 KB | `tollPlazas.ts` | Yes (bundled) | No | No |
| `Land_use_pattern_-_Maharashtra.xls` | 18 KB | — (`AUDIT_REPORT.md` only) | No | No | Yes |
| `Madhya Pradesh.geojson` | 64.6 MB | `roadDatasetManager.ts` | Yes (lazy fetch) | No | No |
| `Maharashtra export.geojson` | 102.4 MB | `roadDatasetManager.ts` | Yes (lazy fetch) | No | No |
| `metadata_contract_awards_…since_fy_2020_…json` | 10 KB | `contractAwards.ts` (imported, unused in UI) | Bundled only | No | No |
| `metadata_contract_awards_…with_indian_suppliers_…json` | 9.5 KB | — | No | No | Yes |
| `north_cities.json` | 110 KB | — | No | No | Yes (duplicate of `cities.json`) |
| `roadwatch_bmc_4010.json` | 80 KB | `realDatasets.ts` | Yes (bundled) | No | No |
| `RS_Session_258_AU_92_A.iii_.csv` | 5.5 KB | `realDatasets.ts`, `infrastructureReports.ts` | Yes (bundled) | No | No |
| `RS_Session_259_AU_1686_B_to_D.csv` | 259 B | `realDatasets.ts` | Yes (bundled) | No | No |
| `RS_Session_267_AU_3631_A.1.csv` | 14 KB | `realDatasets.ts`, `infrastructureReports.ts` | Yes (bundled) | No | No |
| `RS_Session_267_AU_546_A_to_B_i.csv` | 1.6 KB | `realDatasets.ts` | Yes (bundled) | No | No |
| `scan_datasets.py` | 3.5 KB | — (tooling) | No | No | Yes* |
| `southcities.json` | 63 KB | — | No | No | Yes |
| `southern-zone-260529.osm.pbf` | 527.6 MB | — | No | No | Yes‡ |
| `toll-plazas-india.png` | 0.39 MB | — | No | No | Yes |
| `tolls-latest.json` | 2.4 MB | `tollPlazas.ts` | Yes (bundled) | No | No |
| `western-zone-260529.osm.pbf` | 203 MB | — | No | No | Yes‡ |

\*Safe for running/building the app; keep if you use local inventory scripts.  
†Orphaned code path only; state outlines removed from map.  
‡Safe for app runtime; keep if regenerating zone GeoJSON from OSM.

---

## Files > 50 MB

| File | Size (MB) | In production build? |
|------|----------:|----------------------|
| `india-260529.osm.pbf` | 1601 | No (excluded) |
| `southern-zone-260529.osm.pbf` | 528 | No |
| `A.geojson` | 187 | Often skipped (> 65 MB cap) |
| `C.geojson` | 139 | Often skipped |
| `D.geojson` | 132 | Often skipped |
| `F.geojson` | 112 | Often skipped |
| `Maharashtra export.geojson` | 102 | Often skipped |
| `E.geojson` | 91 | Often skipped |
| `B.geojson` | 89 | Deployed if under cap |
| `Madhya Pradesh.geojson` | 65 | Deployed |
| `western-zone-260529.osm.pbf` | 203 | No |

---

## Unused by type

### Unused CSV
- None fully unused — all RS session / ADSI / highways / contract / toll CSVs are bundled.

### Unused JSON
- `cities.json`, `cities2.json`, `north_cities.json`, `southcities.json`
- `metadata_contract_awards_…with_indian_suppliers_05-31-2026.json`
- `India_surface-quality.geojson` (empty)

### Unused GeoJSON / geo text
- `india-osm.geojson.txt`
- `india_state.geojson.txt` (dead import in `stateBoundaries.ts`)
- `India_surface-quality.geojson` (0 features)

### Unused PNG
- `export.png`
- `toll-plazas-india.png`

### Unused XLS/XLSX
- `Land_use_pattern_-_Maharashtra.xls`
- `column_details_contract_awards_…05-31-2026.xlsx`

### Unused PBF (OSM source archives)
- `india-260529.osm.pbf`
- `southern-zone-260529.osm.pbf`
- `western-zone-260529.osm.pbf`

---

## Duplicate datasets

| Group | Files | Notes |
|-------|-------|-------|
| City lists | `cities.json`, `cities2.json`, `north_cities.json` | Byte-identical (~110 KB each) |
| City subset | `southcities.json` | Smaller list; not referenced in code |
| Contract metadata | `metadata_…since_fy_2020…` vs `metadata_…with_indian_suppliers…` | Only FY2020 file imported in `contractAwards.ts` |
| OSM source vs tiles | `*.pbf` vs `A`–`F.geojson` + state exports | PBF = raw OSM; GeoJSON = processed roads for map |
| Mumbai roads | `export.geojson` vs dense OSM in zones | `export.geojson` = focused Mumbai corridor startup layer |

---

## Replaced by newer versions

| Older / parallel | Newer / active | Status |
|------------------|----------------|--------|
| `india-260529.osm.pbf` | Zone `A`–`F.geojson` + state exports | PBF is generation input, not runtime |
| `india-osm.geojson.txt` | Zone GeoJSON tiles | Text export superseded for app |
| `india_state.geojson.txt` | Removed from UI | Boundary layer dropped for performance |
| `cities.json` / `cities2.json` | `indianStates.ts` in frontend | Static TS list used instead |
| `metadata_…with_indian_suppliers…` | `metadata_…since_fy_2020…` | Only FY2020 metadata imported |
| `India_surface-quality.geojson` | — | **New file; empty** — no replacement yet |

---

## `India_surface-quality.geojson` audit

| Field | Value |
|-------|-------|
| Feature count | **0** |
| Geometry type | N/A (empty collection) |
| File size | 246 bytes |
| Properties/columns | None |
| Coverage | None |
| Coordinate system | WGS84 (GeoJSON default; no features) |
| Completeness | **0%** — Overpass export with empty `features: []` |

**Quality metrics present:** None (no road condition score, surface type, roughness, classification, maintenance, or pothole fields).

**Integration status:** Cannot integrate. Continue using composite health / risk engine fallback.

**Missing fields required for integration:**
- `quality_score` or `iri` or `condition_class`
- Road segment identifier (`osm_id`, `road_id`)
- Geometry (`LineString` / `MultiLineString`)
- Optional: `surface`, `roughness`, `last_survey_date`

---

## GeoJSON never imported in code

| File | Referenced? |
|------|-------------|
| `india-osm.geojson.txt` | No |
| `india_state.geojson.txt` | Dead code only |
| `India_surface-quality.geojson` | No |

All other `.geojson` files are registered in `roadDatasetManager.ts`.

---

## Build / deployment notes

- `frontend/vite.config.ts` copies datasets to `dist/datasets`, skipping `.pbf`, `.png`, `india-osm*`, `india_state*`, and files **> 65 MB**.
- Dev server serves all files at `/datasets/*`.
- Bundled CSV/JSON (~17 MB+ main chunk) is separate from lazy GeoJSON fetch.

---

## Recommended cleanup priority (manual, post-hackathon)

1. **High impact, safe:** Remove duplicate city JSON (keep one or none), unused PNG/XLSX, empty `India_surface-quality.geojson` until populated.
2. **Repo size:** Move `*.pbf` to external storage (~2.3 GB).
3. **Dead code:** Remove or stop shipping `stateBoundaries.ts` + `india_state.geojson.txt`.
4. **Production roads:** Host `A`–`F` and `Maharashtra export` on CDN; keep `export.geojson` in deploy.
