# Data Gaps

## Road Ownership

- Missing Dataset: Road segment to owning authority mapping.
- Why Needed: Identify whether a selected road belongs to NHAI, State PWD, municipal authority, or another agency.
- Suggested Source: NHAI, MoRTH, State PWDs, municipal GIS road registers.

## Road Contractor Mapping

- Missing Dataset: Contractor assignment per road segment and work package.
- Why Needed: Show responsible contractor accurately and support accountability.
- Suggested Source: NHAI contract awards, State PWD tender awards, municipal road works departments.

## Authority Mapping

- Missing Dataset: Jurisdiction polygons and department responsibility rules.
- Why Needed: Route complaints to the correct public authority without inference.
- Suggested Source: Municipal GIS departments, State PWD jurisdiction maps, NHAI PIU jurisdiction data.

## Accident Analytics

- Missing Dataset: Location-level accident records with coordinates or road identifiers.
- Why Needed: Current NCRB file is state/city aggregate, not road-segment intelligence.
- Suggested Source: NCRB detailed tables, police FIR/open accident datasets, iRAD, state transport departments.

## Budget Transparency

- Missing Dataset: Structured sanctioned, released, spent, remaining, work-completion, and road-link fields.
- Why Needed: Show budget utilization and anomalies only when mathematically proven.
- Suggested Source: CRIF releases, municipal budgets, PWD work ledgers, e-procurement work orders.

## Corruption Detection

- Missing Dataset: Tender bids, awarded contractors, work completion certificates, payments, quality audits, and delays.
- Why Needed: Detect anomalies without generating corruption scores.
- Suggested Source: GeM/e-procurement portals, CAG reports, departmental audit reports, municipal tender portals.

## Location Intelligence

- Missing Dataset: Verified road geometry, traffic telemetry, weather, AQI, and road condition sources by location.
- Why Needed: Display only verified local context when the user clicks the map.
- Suggested Source: OpenStreetMap extracts, traffic API providers, IMD/OpenWeather, CPCB/AQICN/WAQI, municipal condition surveys.

## Infrastructure Health

- Missing Dataset: Road condition inspections, complaint resolution records, budget utilization, accident risk, and backlog data.
- Why Needed: Calculate a transparent health formula instead of a fabricated percentage.
- Suggested Source: PWD inspection logs, municipal maintenance systems, complaint DB, NCRB/iRAD, budget ledgers.

## Complaint Analytics

- Missing Dataset: Sufficient real complaint records in the database.
- Why Needed: Category, status, monthly trend, and severity charts require actual submitted complaints.
- Suggested Source: RoadWatch PostgreSQL complaint table, municipal grievance systems, integrated complaint APIs.
