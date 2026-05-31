# Contractor Capability Report

## What is Currently Possible

Based on the available datasets, we can generate macro-level intelligence regarding contractors and tenders:

1. **Ministerial Tender Compliance**: Using `RS_Session_267_AU_546_A_to_B_i.csv`, we can flag which ministries or road agencies have the highest ratio of "Non-Compliant Tenders Found". This serves as a proxy for systemic corruption or poor oversight.
2. **Project Sanctioned Costs**: Using `RS_Session_258_AU_92_A.iii_.csv` and `RS_Session_267_AU_3631_A.1.csv`, we can map the exact financial value (in Rs Lakh / Crore) allocated to specific highway projects and districts.
3. **Macro Budget vs Output**: Comparing the sanctioned project costs against the actual Budget Utilization (`RS_Session_259_AU_1686_B_to_D.csv`) allows us to highlight capital expenditure efficiency.

## What is Blocked (Missing Data)

Because we lack the raw "Award of Contract" (AOC) files from CPPP (`contractor_awards.csv`):

1. **Named Contractor Accountability**: We cannot map a specific failing highway (e.g., one with high accidents or complaints) to a specific corporate entity (e.g., "Larsen & Toubro", "Dilip Buildcon").
2. **Bid Deflation Analytics**: We cannot calculate if a contractor won a bid by undercutting the estimate by 30% (a strong indicator of future poor road quality).
3. **Blacklisted Entity Tracking**: We cannot automatically verify if the company awarded a project in District A was previously blacklisted in District B.

### Recommendations
- **Source Dataset**: `RS_Session` CSV files (Available).
- **Confidence Level**: 85% for financial cost analytics, 0% for specific contractor identification.
- **Limitations**: We are restricted to aggregating financial anomalies rather than exposing specific bad actors until CPPP data is manually parsed and uploaded.
