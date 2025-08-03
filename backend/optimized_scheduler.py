import pandas as pd
from ortools.sat.python import cp_model
import json

def caretaker_json_to_df(caretaker_json):
    data = []
    for caretaker, day_map in caretaker_json.items():
        for day, hour_map in day_map.items():
            for hour, patient in hour_map.items():
                data.append({"Caretaker": caretaker, "Day": day, "Hour": int(hour), "Patient": patient})
    return pd.DataFrame(data)

def optimize_caretaker_schedule(caretaker_json):
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    hours = list(range(8, 18))
    df = caretaker_json_to_df(caretaker_json)
    if df.empty:
        return {}
    caretakers = df["Caretaker"].unique()
    patients = df["Patient"].unique()
    assignments = {(c, p) for c in caretakers for p in df[df["Caretaker"] == c]["Patient"].unique()}

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
    model.Minimize(sum(x[c, p, d, h] for (c, p, d, h) in x))

    solver = cp_model.CpSolver()
    status = solver.Solve(model)
    schedule = []
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        for (c, p, d, h), var in x.items():
            if solver.BooleanValue(var):
                schedule.append({"Caretaker": c, "Patient": p, "Day": d, "Hour": h})
    df_out = pd.DataFrame(schedule)
    caretaker_json_out = {}
    for c in df_out["Caretaker"].unique():
        df_c = df_out[df_out["Caretaker"] == c]
        day_hour = {}
        for _, row in df_c.iterrows():
            day = row["Day"]
            hour = int(row["Hour"])
            patient = row["Patient"]
            day_hour.setdefault(day, {})[hour] = patient
        caretaker_json_out[c] = day_hour
    return caretaker_json_out

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input_json", type=str, required=True, help="Path to input caretaker schedule JSON")
    parser.add_argument("--output_json", type=str, required=True, help="Path to output optimized caretaker schedule JSON")
    args = parser.parse_args()
    with open(args.input_json) as f:
        caretaker_json = json.load(f)
    optimized = optimize_caretaker_schedule(caretaker_json)
    with open(args.output_json, "w") as f:
        json.dump(optimized, f, indent=2)
    print(f"Optimized caretaker schedule written to {args.output_json}")
