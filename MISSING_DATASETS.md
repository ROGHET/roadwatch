# Missing Datasets Audit

## 1. Contractor Awards
- **Dataset Name**: Contractor Awards (Award of Contract)
- **Official Source**: Central Public Procurement Portal (CPPP)
- **URL**: https://eprocure.gov.in/cppp/
- **Reason Download Failed**: Dynamic table with Captcha.
- **Login Required?**: No
- **Captcha?**: Yes
- **PDF Only?**: Yes (Often provided as scanned AOC PDFs)
- **Restricted?**: No
- **Exact Manual Steps Required**: 
  1. Go to https://eprocure.gov.in/cppp/
  2. Click on "Result of Tenders"
  3. Enter keywords like "Road Construction", "NHAI", or filter by state.
  4. Solve Captcha and Search.
  5. Click Tender ID and download AOC PDF. Convert PDF to CSV manually.
- **Expected Fields**: `Tender ID`, `Contractor Name`, `Awarded Value`, `Project Name`, `Date of Award`
- **Feature Blocked**: Contractor Intelligence (Partial)

## 2. Maintenance History
- **Dataset Name**: Road Asset Maintenance Records
- **Official Source**: NHAI Road Asset Management System (RAMS)
- **URL**: https://nhai.gov.in/ / Internal Contractor Dashboards
- **Reason Download Failed**: Restricted internal platform.
- **Login Required?**: Yes (Employee/Contractor portal)
- **Captcha?**: N/A
- **PDF Only?**: N/A
- **Restricted?**: Yes
- **Exact Manual Steps Required**:
  1. File an RTI or request API access as a public interest entity.
  2. Alternatively, extract summary maintenance contracts from CPPP.
- **Expected Fields**: `Road ID`, `Last Maintained Date`, `Repair Type`, `Contractor`, `Cost`
- **Feature Blocked**: Predictive Maintenance, Contractor Accountability

## 3. Road Condition
- **Dataset Name**: Pothole and Surface Quality Index
- **Official Source**: MoRTH / NHAI Data Lake / Bhuvan
- **URL**: https://bhuvan.nrsc.gov.in/ / Internal NSV data
- **Reason Download Failed**: Restricted/Not Open Data.
- **Login Required?**: Yes
- **Captcha?**: N/A
- **PDF Only?**: N/A
- **Restricted?**: Yes
- **Exact Manual Steps Required**:
  1. Rely on crowd-sourced municipal data (like the BMC json we have) or use API keys for private providers (e.g., TomTom/Google).
- **Expected Fields**: `Lat`, `Lon`, `Road ID`, `IRI (International Roughness Index)`, `Pothole Count`
- **Feature Blocked**: Real-time Hazard Map

## 4. Weather Warnings
- **Dataset Name**: District-wise Nowcast & Warnings
- **Official Source**: IMD (India Meteorological Department)
- **URL**: https://mausam.imd.gov.in/
- **Reason Download Failed**: No direct CSV download for warnings, requires authorized API access or scraper.
- **Login Required?**: No (for web), Yes (for API)
- **Captcha?**: No
- **PDF Only?**: No
- **Restricted?**: Partially (API restricted)
- **Exact Manual Steps Required**:
  1. Contact IMD Nodal Officer to get an API key.
  2. Alternatively, use community scrapers (like OpenCity) to extract JSON from IMD website dynamically.
- **Expected Fields**: `District`, `Warning Level`, `Phenomenon`, `Validity`
- **Feature Blocked**: Weather-based Risk Routing

## 5. Detailed Road GIS (SHP/GeoJSON)
- **Dataset Name**: PMGSY/NHAI GIS Shapefiles
- **Official Source**: PMGSY OMMS
- **URL**: http://omms.nic.in/
- **Reason Download Failed**: Requires Login/Captcha for GIS downloads.
- **Login Required?**: Yes (for exact geospatial exports)
- **Captcha?**: Yes
- **PDF Only?**: No
- **Restricted?**: Yes
- **Exact Manual Steps Required**:
  1. Navigate to OMMS GIS portal.
  2. Login with official credentials or find public mirror.
  3. Export layers to KML/SHP.
- **Expected Fields**: `geometry`, `Road_Name`, `Class`, `Length`
- **Feature Blocked**: High-precision Map Rendering (falling back to generic CSV lengths)

## 6. Jurisdiction Mapping
- **Dataset Name**: Local Government Directory (LGD) Ward/Village maps
- **Official Source**: LGD Portal
- **URL**: https://lgdirectory.gov.in/
- **Reason Download Failed**: Captcha protected dynamic exports.
- **Login Required?**: No
- **Captcha?**: Yes
- **PDF Only?**: No
- **Restricted?**: No
- **Exact Manual Steps Required**:
  1. Go to LGD site.
  2. Select State -> District -> Sub-district.
  3. Solve Captcha and export mapping list.
- **Expected Fields**: `LGD Code`, `Entity Name`, `Parent Entity`, `Level`
- **Feature Blocked**: Automated RTI Routing (Partial)
