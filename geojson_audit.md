# GeoJSON Audit

## 1. export.geojson
- **Geometry Type**: LineString
- **Feature Count**: 5,931
- **Usable for Road Mapping?**: Yes (Contains valid `highway` tags and LineString geometries).

## 2. india-osm.geojson.txt / india_state.geojson.txt
- **Geometry Type**: None
- **Feature Count**: 0
- **Usable for Road Mapping?**: No (These are empty/invalid text files).

## 3. OSM PBF Files (india-260529.osm.pbf, southern/western zones)
- **Geometry Type**: Binary OSM elements (Nodes, Ways, Relations)
- **Feature Count**: Millions (Full regional subsets)
- **Usable for Road Mapping?**: Yes (Requires conversion).

### Feasibility of generating `roads.geojson`
**Yes, it is highly feasible.** 
The raw PBF files (`india-260529.osm.pbf`, etc.) contain the complete road network geometry. To generate a specific `roads.geojson` file, you can use the `osmium` command-line tool to filter for `highway=*` tags, and then `ogr2ogr` (from GDAL) to convert the filtered PBF into GeoJSON. This will unlock full-fidelity, highly accurate road polygons and linestrings for CrashZero without needing restricted government Shapefiles.
