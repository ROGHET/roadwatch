# Dataset Inventory

## 1. ADSI_Table_1A.2.csv
- **Dataset Purpose**: Records accidental deaths and suicides in India, specifically traffic and road accidents.
- **Coverage**: State/UT/City level (India)
- **Columns**: `Sl. No.`, `State/UT/City`, `Road Accidents - Cases`, `Road Accidents - Injured`, `Road Accidents - Died`, `Railway...`, `Total Traffic...`
- **Geometry Availability**: None (Tabular only)
- **Missing Fields**: Granular latitude/longitude of accidents, date/time of incidents.
- **Features Unlocked**: High-level accident hotspot identification, safety risk scoring.

## 2. cities.json
- **Dataset Purpose**: Reference list of cities and their corresponding states.
- **Coverage**: India (1221 cities)
- **Columns**: `id`, `name`, `state`
- **Geometry Availability**: None
- **Missing Fields**: Bounding boxes, centroid coordinates.
- **Features Unlocked**: Dropdown populations, basic location filtering.

## 3. export.geojson
- **Dataset Purpose**: OpenStreetMap vector data export containing highway and road geometries.
- **Coverage**: Specific regional export
- **Columns**: `@id`, `bicycle`, `highway`, `lanes`, `maxspeed`, `name`, `name:hi`, `name:mr`, `oneway`, `source`
- **Geometry Availability**: LineString
- **Missing Fields**: Maintenance entity, official road ID mapping (NH/SH numbers).
- **Features Unlocked**: Map rendering, road network visualization, basic routing.

## 4. hways_statehighways_0.csv
- **Dataset Purpose**: State highways inventory with length metrics.
- **Coverage**: Specific State Highways
- **Columns**: `SH. No.`, `Name of the Road`, `Starting KM.`, `Ending KM`, `Total Length KM.`
- **Geometry Availability**: None
- **Missing Fields**: LineString geometry, spatial coordinates.
- **Features Unlocked**: Jurisdiction mapping, road ownership, road length normalization for health scores.

## 5. india-260529.osm.pbf, southern-zone-260529.osm.pbf, western-zone-260529.osm.pbf
- **Dataset Purpose**: Highly compressed raw OpenStreetMap data for full country/zones.
- **Coverage**: India / Southern Zone / Western Zone
- **Columns**: N/A (Binary PBF)
- **Geometry Availability**: Nodes, Ways, Relations (Point, LineString, Polygon)
- **Missing Fields**: N/A (Contains all OSM tags)
- **Features Unlocked**: Complete offline map hosting, custom road extraction (`roads.geojson`), advanced routing networks.

## 6. Land_use_pattern_-_Maharashtra.xls
- **Dataset Purpose**: Agricultural and land use statistics.
- **Coverage**: Maharashtra
- **Columns**: N/A (Standard XLS format)
- **Geometry Availability**: None
- **Missing Fields**: Spatial polygons.
- **Features Unlocked**: Environmental context around highways.

## 7. roadwatch_bmc_4010.json
- **Dataset Purpose**: Municipal complaint records or RTI queries.
- **Coverage**: Mumbai (BMC)
- **Columns**: `source_file`, `document_type`, `integration_ready`, `pages`
- **Geometry Availability**: None
- **Missing Fields**: Geocoded complaint locations.
- **Features Unlocked**: Complaint tracking, municipal accountability metrics.

## 8. RS_Session_258_AU_92_A.iii_.csv & RS_Session_267_AU_3631_A.1.csv
- **Dataset Purpose**: Rajya Sabha answers regarding sanctioned costs and road projects.
- **Coverage**: National / District level projects
- **Columns**: `S. No.`, `Year`, `Name of Work`, `Sanctioned Cost...`, `Length (km)`
- **Geometry Availability**: None
- **Missing Fields**: Exact contractor details, spatial vectors.
- **Features Unlocked**: Work package tracking, capital expenditure analysis.

## 9. RS_Session_259_AU_1686_B_to_D.csv
- **Dataset Purpose**: Highway budget accruals and releases across financial years.
- **Coverage**: National
- **Columns**: `Year`, `2019-20 - Accrual`, `2019-20 - Release`, etc.
- **Geometry Availability**: None
- **Missing Fields**: Project-specific breakdowns.
- **Features Unlocked**: National budget utilization tracking.

## 10. RS_Session_267_AU_546_A_to_B_i.csv
- **Dataset Purpose**: Tender evaluation and compliance reports from ministries.
- **Coverage**: National / Ministerial level
- **Columns**: `Name of the Ministry`, `Total Tenders Evaluated`, `Non-Compliant Tenders Found`
- **Geometry Availability**: None
- **Missing Fields**: Specific offending contractor names.
- **Features Unlocked**: Macro-level contractor and tender compliance intelligence.

*(Note: `india-osm.geojson.txt` and `india_state.geojson.txt` are currently empty/placeholder text files and have been excluded from active inventory).*
