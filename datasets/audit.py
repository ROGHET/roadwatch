import csv
import json
import os

dir_path = 'F:/Hackathon/roadwatch/datasets'
files = os.listdir(dir_path)

for f in files:
    path = os.path.join(dir_path, f)
    if f.endswith('.csv'):
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                reader = csv.reader(file)
                header = next(reader)
                rows = sum(1 for row in reader)
                print(f'FILE: {f}\nFORMAT: CSV\nROWS: {rows}\nCOLS: {header}\n')
        except Exception as e:
            print(f'FILE: {f}\nFORMAT: CSV\nERROR: {e}\n')
    elif f.endswith('.json'):
        try:
            with open(path, 'r', encoding='utf-8', errors='ignore') as file:
                data = json.load(file)
                if isinstance(data, dict):
                    print(f'FILE: {f}\nFORMAT: JSON\nKEYS: {list(data.keys())[:10]}\n')
                elif isinstance(data, list):
                    print(f'FILE: {f}\nFORMAT: JSON ARRAY\nLENGTH: {len(data)}\nKEYS (first item): {list(data[0].keys()) if len(data) > 0 and isinstance(data[0], dict) else []}\n')
        except Exception as e:
            print(f'FILE: {f}\nFORMAT: JSON\nERROR: {e}\n')
    elif os.path.isfile(path) and f != 'audit.py':
        print(f'FILE: {f}\nFORMAT: {f.split(".")[-1].upper()}\nSIZE: {os.path.getsize(path)} bytes\n')
