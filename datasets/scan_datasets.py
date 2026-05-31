import os
import json
import csv

dir_path = 'F:/Hackathon/roadwatch/datasets'
inventory = []
geojson_audit = []

for root, _, files in os.walk(dir_path):
    for f in files:
        if f == 'scan_datasets.py' or f == 'audit.py': continue
        path = os.path.join(root, f)
        rel_path = os.path.relpath(path, dir_path)
        ext = os.path.splitext(f)[1].lower()
        
        info = {
            'filename': rel_path,
            'format': ext,
            'columns': [],
            'row_count': 0,
            'geometry': 'None',
            'missing_fields': [],
            'error': None
        }
        
        if ext == '.csv':
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                    reader = csv.reader(file)
                    header = next(reader)
                    info['columns'] = header
                    info['row_count'] = sum(1 for _ in reader)
            except Exception as e:
                info['error'] = str(e)
                
        elif ext == '.geojson' or ext == '.json':
            try:
                with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                    data = json.load(file)
                    if ext == '.geojson' or (isinstance(data, dict) and data.get('type') == 'FeatureCollection'):
                        info['format'] = '.geojson'
                        features = data.get('features', [])
                        info['row_count'] = len(features)
                        
                        geom_types = set()
                        usable_for_roads = False
                        if features:
                            for feat in features[:100]: # Check first 100 features
                                geom = feat.get('geometry')
                                if geom and 'type' in geom:
                                    geom_types.add(geom['type'])
                                    if geom['type'] == 'LineString' or geom['type'] == 'MultiLineString':
                                        usable_for_roads = True
                                props = features[0].get('properties', {})
                                info['columns'] = list(props.keys())
                        
                        info['geometry'] = ', '.join(list(geom_types)) if geom_types else 'None'
                        
                        geojson_audit.append({
                            'filename': rel_path,
                            'geometry_type': info['geometry'],
                            'feature_count': len(features),
                            'usable': 'Yes' if usable_for_roads else 'No'
                        })
                    elif isinstance(data, dict):
                        info['columns'] = list(data.keys())
                        info['row_count'] = 1
                    elif isinstance(data, list) and len(data) > 0 and isinstance(data[0], dict):
                        info['columns'] = list(data[0].keys())
                        info['row_count'] = len(data)
            except Exception as e:
                info['error'] = str(e)
        
        elif ext in ['.xls', '.xlsx', '.pbf', '.pdf']:
            info['row_count'] = 'N/A'
            info['columns'] = []
            
        inventory.append(info)

print("INVENTORY_START")
print(json.dumps(inventory, indent=2))
print("INVENTORY_END")

print("GEOJSON_AUDIT_START")
print(json.dumps(geojson_audit, indent=2))
print("GEOJSON_AUDIT_END")
