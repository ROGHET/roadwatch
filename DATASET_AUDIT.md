# Dataset Audit

## 1. ADSI_Table_1A.2.csv
- **Source**: NCRB (Accidental Deaths & Suicides in India)
- **Format**: CSV
- **Row Count**: 93
- **Columns**: `Sl. No.`, `State/UT/City`, `Road Accidents - Cases`, `Road Accidents - Injured`, `Road Accidents - Died`, `Railway Accidents - Cases`, `Railway Accidents - Injured`, `Railway Accidents - Died`, `Railway Crossing Accidents - Cases`, `Railway Crossing Accidents - Injured`, `Railway Crossing Accidents - Died`, `Total Traffic Accidents - Cases`, `Total Traffic Accidents - Injured`, `Total Traffic Accidents - Died`
- **Completeness**: 100%
- **Features Unlocked**: Accident Locations, CrashZero Hotspot Analysis

## 2. hways_statehighways_0.csv
- **Source**: MoRTH / State PWD Portals
- **Format**: CSV
- **Row Count**: 367
- **Columns**: `SH. No.`, `Name of the Road`, `Starting KM.`, `Ending KM`, `Total Length KM.`
- **Completeness**: 100%
- **Features Unlocked**: Road Ownership, Jurisdiction Mapping, Road GIS

## 3. Land_use_pattern_-_Maharashtra.xls
- **Source**: Bhuvan / State Govt Open Data
- **Format**: XLS
- **Row Count**: N/A (18432 bytes)
- **Columns**: N/A
- **Completeness**: 100%
- **Features Unlocked**: Land Use Analysis

## 4. roadwatch_bmc_4010.json
- **Source**: Municipal Open-Data Portals (BMC)
- **Format**: JSON
- **Row Count**: N/A (JSON structure)
- **Columns/Keys**: `source_file`, `document_type`, `integration_ready`, `pages`
- **Completeness**: 100%
- **Features Unlocked**: Complaint Records, RTI Generation

## 5. RS_Session_258_AU_92_A.iii_.csv
- **Source**: data.gov.in (Rajya Sabha Unstarred Question)
- **Format**: CSV
- **Row Count**: 59
- **Columns**: `S. No.`, `Year `, `Name of Work`, `Sanctioned Cost in Rs Lakh`
- **Completeness**: 100%
- **Features Unlocked**: Work Packages, Budget Utilization

## 6. RS_Session_259_AU_1686_B_to_D.csv
- **Source**: data.gov.in (Rajya Sabha Unstarred Question)
- **Format**: CSV
- **Row Count**: 1
- **Columns**: `Year`, `2019-20 - Accrual`, `2019-20 - Release`, `2020-21 - Accrual`, `2020-21 - Release`, `2021-22 - Accrual`, `2021-22 - Release`, `2022-23 (Till 28-02-2023) - Accrual`, `2022-23 (Till 28-02-2023) - Release`
- **Completeness**: 100%
- **Features Unlocked**: Budget Utilization

## 7. RS_Session_267_AU_3631_A.1.csv
- **Source**: data.gov.in (Rajya Sabha Unstarred Question)
- **Format**: CSV
- **Row Count**: 64
- **Columns**: `Sl. No.`, `District`, `Category`, `Name of Work`, `Length (km)`, `Cost (Rs. Crore)`
- **Completeness**: 100%
- **Features Unlocked**: Work Packages, Budget Utilization, Road GIS (Length info)

## 8. RS_Session_267_AU_546_A_to_B_i.csv
- **Source**: data.gov.in (Rajya Sabha Unstarred Question)
- **Format**: CSV
- **Row Count**: 36
- **Columns**: `Sl. No.`, `Name of the Ministry`, `Total Tenders Evaluated`, `Non-Compliant Tenders Found`, `Compliance Report received as on 31-01-2025`
- **Completeness**: 100%
- **Features Unlocked**: Contractor Intelligence, Contractor Awards
