# Road Condition Score Workaround Strategy

Since direct Infrastructure Health Scores (IRI/Pothole counts) from MoRTH/NHAI are restricted, we must derive a composite **Infrastructure Health Score (IHS)** using existing datasets in our `datasets/` folder.

## Inputs Available
1. **Accident Frequency**: `ADSI_Table_1A.2.csv` (Total accidents/deaths per region).
2. **Citizen Complaints**: `roadwatch_bmc_4010.json` (Municipal grievance density).
3. **Budget Utilization**: `RS_Session_259_AU_1686_B_to_D.csv` (Funds accrued vs released).
4. **Tender Compliance**: `RS_Session_267_AU_546_A_to_B_i.csv` (Non-compliant tender ratio).
5. **Road Length**: `hways_statehighways_0.csv` (Normalization factor).

---

## Formula A: The Safety-First Index
Focuses heavily on tangible negative outcomes (accidents and complaints).

**Score (0-100, where 100 is pristine)** = 
`100 - ( (Accidents_Per_KM * W1) + (Complaints_Per_KM * W2) )`
*Where W1 = 60, W2 = 40.*

- **Pros**: Relies on solid, undeniable outcome metrics.
- **Cons**: Ignores underlying systemic issues like bad contractors or unspent budgets.

## Formula B: The Systemic Failure Index
Focuses on bureaucratic and financial mismanagement as leading indicators of bad roads.

**Score (0-100)** = 
`100 - ( (Unutilized_Budget_Percentage * W1) + (Non_Compliant_Tender_Ratio * W2) )`
*Where W1 = 50, W2 = 50.*

- **Pros**: Can predict bad roads before accidents happen.
- **Cons**: Broad national/state data; hard to map to specific highway stretches.

---

## 🏆 Recommended Formula: The CrashZero Composite Health Score

**Score = Base (100) - Penalty**

`Penalty = (Accidents_Normalized * 0.45) + (Complaints_Normalized * 0.35) + (Tender_Failure_Ratio * 0.10) + (Budget_Deficit_Ratio * 0.10)`

*Normalization*: Accident/Complaint metrics must be divided by Road Length (`hways_statehighways_0.csv`) to ensure long highways aren't unfairly penalized just for being long.

### Specifications
- **Source Datasets**: `ADSI_Table_1A.2.csv`, `roadwatch_bmc_4010.json`, `hways_statehighways_0.csv`, `RS_Session_267_AU_546_A_to_B_i.csv`
- **Confidence Level**: **75%** for State-level aggregation, **60%** for exact Highway-level precision.
- **Limitations**: We lack exact GPS coordinates for accidents in the `ADSI` dataset (only state/city level). Therefore, the "Road Condition" score will represent regional infrastructure health rather than specific pothole locations on a 1km stretch.
