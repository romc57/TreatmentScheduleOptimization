import pandas as pd
from ortools.sat.python import cp_model
import json

# Load input Excel
input_path = "caretaker_schedule.xlsx"
xls = pd.ExcelFile(input_path)
sheet_names = xls.sheet_names

# Read and unify schedule
data = []
for sheet in sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet)
    df = df.melt(id_vars=["Hour"], var_name="Day", value_name="Patient")
    df["Caretaker"] = sheet
    data.append(df)
df = pd.concat(data).dropna(subset=["Patient"]).reset_index(drop=True)

# Define sets
days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
hours = list(range(8, 18))
caretakers = df["Caretaker"].unique()
patients = df["Patient"].unique()
assignments = {(c, p) for c in caretakers for p in df[df["Caretaker"] == c]["Patient"].unique()}

# OR-Tools model
model = cp_model.CpModel()
x = {}
for c in caretakers:
    for p in patients:
        if (c, p) in assignments:
            for d in days:
                for h in hours:
                    x[c, p, d, h] = model.NewBoolVar(f"x_{c}_{p}_{d}_{h}")

# Constraints
for c in caretakers:
    for d in days:
        works = [x[c, p, d, h] for p in patients if (c, p) in assignments for h in hours if (c, p, d, h) in x]
        model.Add(sum(works) >= 5)

for p in patients:
    for d in days:
        model.Add(sum(x[c, p, d, h] for c in caretakers if (c, p, d, h) in x for h in hours) >= 3)

for p in patients:
    for d in days:
        for h in hours:
            model.Add(sum(x[c, p, d, h] for c in caretakers if (c, p, d, h) in x) <= 1)

for p in patients:
    for d in days:
        for c in caretakers:
            if (c, p) in assignments:
                model.Add(sum(x[c, p, d, h] for h in hours if (c, p, d, h) in x) <= 1)

# Objective: spread minimization (optional, simplified)
model.Minimize(sum(x[c, p, d, h] for (c, p, d, h) in x))

# Solve
solver = cp_model.CpSolver()
status = solver.Solve(model)

# Collect results
schedule = []
if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
    for (c, p, d, h), var in x.items():
        if solver.BooleanValue(var):
            schedule.append({"Caretaker": c, "Patient": p, "Day": d, "Hour": h})

df_out = pd.DataFrame(schedule)

# Output: two JSONs, one for caretakers, one for patients
caretaker_json = {}
for c in df_out["Caretaker"].unique():
    df_c = df_out[df_out["Caretaker"] == c]
    # {day: {hour: patient}}
    day_hour = {}
    for _, row in df_c.iterrows():
        day = row["Day"]
        hour = int(row["Hour"])
        patient = row["Patient"]
        day_hour.setdefault(day, {})[hour] = patient
    caretaker_json[c] = day_hour

patient_json = {}
for p in df_out["Patient"].unique():
    df_p = df_out[df_out["Patient"] == p]
    day_hour = {}
    for _, row in df_p.iterrows():
        day = row["Day"]
        hour = int(row["Hour"])
        caretaker = row["Caretaker"]
        day_hour.setdefault(day, {})[hour] = caretaker
    patient_json[p] = day_hour

with open("caretaker_schedule.json", "w") as f:
    json.dump(caretaker_json, f, indent=2)
with open("patient_schedule.json", "w") as f:
    json.dump(patient_json, f, indent=2)

print("Caretaker JSON written to caretaker_schedule.json")
print("Patient JSON written to patient_schedule.json")
