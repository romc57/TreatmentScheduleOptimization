import pandas as pd
from ortools.sat.python import cp_model
import json

def caretaker_json_to_df(caretaker_json):
    data = []
    # caretaker_json is a list of dicts with 'name' and 'schedule'
    for caretaker in caretaker_json:
        name = caretaker.get('name')
        schedule = caretaker.get('schedule', {})
        for day, hour_map in schedule.items():
            for hour, patient in hour_map.items():
                data.append({"Caretaker": name, "Day": day, "Hour": int(hour), "Patient": patient})
    return pd.DataFrame(data)

def _create_variables(model, caretakers, patients, assignments, days, hours):
    x = {}
    for c in caretakers:
        for p in patients:
            if (c, p) in assignments:
                for d in days:
                    for h in hours:
                        x[c, p, d, h] = model.NewBoolVar(f"x_{c}_{p}_{d}_{h}")
    return x    

def _add_constraints(model, x, caretakers, patients, assignments, days, hours):
    constraint_count = 0
    
    # 1. Caretaker Minimum Working Time: Each caretaker should work at least 3 hours per day (reduced from 5)
    for c in caretakers:
        for d in days:
            # Make this a soft constraint by using maximize objective instead
            assigned_hours = sum(x[c, p, d, h] for p in patients for h in hours if (c, p, d, h) in x)
            model.Maximize(assigned_hours)
            constraint_count += 1

    # 2. Patient Minimum Treatments: Each patient should receive at least 2 treatments per day (reduced from 3)
    for p in patients:
        for d in days:
            # Make this a soft constraint by using maximize objective instead
            treatments = sum(x[c, p, d, h] for c in caretakers for h in hours if (c, p, d, h) in x)
            model.Maximize(treatments)
            constraint_count += 1

    # 3. No Overlapping Appointments: A patient cannot be treated by more than one caretaker at the same hour
    # This is a hard constraint that must be maintained
    for p in patients:
        for d in days:
            for h in hours:
                model.Add(sum(x[c, p, d, h] for c in caretakers if (c, p, d, h) in x) <= 1)
                constraint_count += 1

    # 4. Unique Caretaker Per Day Per Patient: A patient cannot be treated by the same caretaker more than once on the same day
    # This is our primary hard constraint that must be maintained
    for c in caretakers:
        for p in patients:
            for d in days:
                if (c, p) in assignments:
                    model.Add(sum(x[c, p, d, h] for h in hours if (c, p, d, h) in x) <= 1)
                    constraint_count += 1

    print(f"[DEBUG] Added {constraint_count} constraints")
    return constraint_count

def _extract_solution(solver, x):
    schedule = []
    for (c, p, d, h), var in x.items():
        if solver.BooleanValue(var):
            schedule.append({"Caretaker": c, "Patient": p, "Day": d, "Hour": h})
    return schedule

def _format_output(schedule, original_caretakers=None):
    import pandas as pd
    df_out = pd.DataFrame(schedule)
    # Build a mapping from caretaker name to optimized schedule
    optimized_schedules = {}
    if not df_out.empty:
        for c in df_out["Caretaker"].unique():
            df_c = df_out[df_out["Caretaker"] == c]
            day_hour = {}
            for _, row in df_c.iterrows():
                day = row["Day"]
                hour = int(row["Hour"])
                patient = row["Patient"]
                day_hour.setdefault(day, {})[hour] = patient
            optimized_schedules[c] = day_hour
    # If original_caretakers is provided, preserve order and extra fields
    if original_caretakers is not None:
        caretakers_list = []
        for caretaker in original_caretakers:
            name = caretaker.get('name')
            new_schedule = optimized_schedules.get(name, {})
            new_caretaker = dict(caretaker)
            new_caretaker['schedule'] = new_schedule
            caretakers_list.append(new_caretaker)
        return {'caretakers': caretakers_list}
    # Fallback: just return the optimized list
    caretakers_list = [
        {'name': c, 'schedule': sched}
        for c, sched in optimized_schedules.items()
    ]
    return {'caretakers': caretakers_list}


def optimize_caretaker_schedule(caretaker_json):
    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
    hours = list(range(8, 18))
    df = caretaker_json_to_df(caretaker_json['caretakers'])
    if df.empty:
        return {'caretakers': []}

    caretakers = df["Caretaker"].unique()
    patients = df["Patient"].unique()
    assignments = {(c, p) for c in caretakers for p in df[df["Caretaker"] == c]["Patient"].unique()}

    model = cp_model.CpModel()
    x = _create_variables(model, caretakers, patients, assignments, days, hours)
    _add_constraints(model, x, caretakers, patients, assignments, days, hours)
    
    # Objective: Minimize total appointments while maximizing assigned slots
    model.Minimize(sum(1000 - x[c, p, d, h] for (c, p, d, h) in x))

    solver = cp_model.CpSolver()
    solver.parameters.max_time_in_seconds = 60  # Add timeout to prevent long solving times
    status = solver.Solve(model)
    print(f"[DEBUG] Solver status: {status} (OPTIMAL={cp_model.OPTIMAL}, FEASIBLE={cp_model.FEASIBLE})")
    
    if status in (cp_model.OPTIMAL, cp_model.FEASIBLE):
        schedule = _extract_solution(solver, x)
        print(f"[DEBUG] Found solution with {len(schedule)} assignments")
        return _format_output(schedule, caretaker_json['caretakers'])
    else:
        print("[DEBUG] No feasible solution found. Returning original input.")
        return {'caretakers': caretaker_json['caretakers']}

if __name__ == "__main__":
    data = {'caretakers': [{'name': 'Paula (nurse)', 'schedule': {'Sunday': {'8': 'P022', '9': 'P023', '10': 'P024', '11': 'P025', '12': 'P026', '13': 'P027', '14': 'P028'}, 'Monday': {'8': 'P024', '10': 'P028', '11': 'P025', '12': 'P011', '14': 'P010', '17': 'P020'}, 'Tuesday': {'8': 'P008', '9': 'P009', '10': 'P017', '11': 'P021', '12': 'P026', '13': 'P023', '14': 'P014'}, 'Wednesday': {'8': 'P027', '9': 'P016', '10': 'P017', '11': 'P018', '12': 'P019', '13': 'P020', '14': 'P021'}, 'Thursday': {'11': 'P004', '13': 'P021', '14': 'P027', '17': 'P020'}, 'Friday': {'8': 'P001', '9': 'P002', '10': 'P003', '11': 'P013', '12': 'P020', '13': 'P006', '14': 'P007', '15': 'P028', '16': 'P008'}}}, {'name': 'Mila (care_assistant)', 'schedule': {'Sunday': {'8': 'P079', '9': 'P080', '10': 'P072', '11': 'P066', '12': 'P005', '13': 'P049', '14': 'P017', '15': 'P018', '17': 'P070'}, 'Monday': {'8': 'P053', '9': 'P075', '10': 'P049', '11': 'P070', '12': 'P063', '13': 'P073', '14': 'P080', '15': 'P051'}, 'Tuesday': {'9': 'P049', '11': 'P017', '12': 'P070', '13': 'P039'}, 'Wednesday': {'11': 'P051', '14': 'P017', '16': 'P026', '17': 'P079'}, 'Thursday': {'10': 'P066', '13': 'P013', '14': 'P005', '15': 'P017', '17': 'P023'}, 'Friday': {'8': 'P039', '9': 'P001', '10': 'P023', '11': 'P080', '12': 'P062', '13': 'P063', '14': 'P013', '15': 'P070'}}}, {'name': 'Leo (doctor)', 'schedule': {'Sunday': {'8': 'P077', '9': 'P076', '10': 'P021', '11': 'P014', '12': 'P071', '14': 'P024', '17': 'P009'}, 'Monday': {'9': 'P014', '10': 'P022', '12': 'P077', '13': 'P060', '14': 'P024'}, 'Tuesday': {'8': 'P064', '9': 'P014', '10': 'P075', '12': 'P077', '13': 'P053', '14': 'P080', '15': 'P024'}, 'Wednesday': {'8': 'P054', '9': 'P079', '10': 'P010', '11': 'P025', '12': 'P076', '13': 'P080', '14': 'P078'}, 'Thursday': {'8': 'P047', '9': 'P009', '10': 'P075', '11': 'P060', '12': 'P013', '13': 'P018', '14': 'P028'}, 'Friday': {'8': 'P076', '9': 'P075', '11': 'P018', '12': 'P071', '13': 'P025', '14': 'P001', '15': 'P079'}}}, {'name': 'Diana (therapist)', 'schedule': {'Sunday': {'13': 'P068', '15': 'P032'}, 'Monday': {'16': 'P032'}, 'Tuesday': {'12': 'P032', '15': 'P072', '16': 'P068'}, 'Wednesday': {}, 'Thursday': {'13': 'P072'}, 'Friday': {'13': 'P001'}}}, {'name': 'Victor (therapist)', 'schedule': {'Sunday': {'8': 'P008', '10': 'P019', '11': 'P026', '12': 'P079', '13': 'P029', '14': 'P027', '16': 'P066'}, 'Monday': {'9': 'P064', '11': 'P065', '12': 'P019', '13': 'P031', '14': 'P008', '15': 'P061', '16': 'P007'}, 'Tuesday': {'9': 'P007', '10': 'P021', '11': 'P060', '12': 'P018', '13': 'P027', '14': 'P034', '15': 'P024', '16': 'P011'}, 'Wednesday': {'8': 'P026', '10': 'P037', '12': 'P002'}, 'Thursday': {'9': 'P037', '11': 'P065', '12': 'P061', '13': 'P030', '14': 'P019', '15': 'P007', '16': 'P064', '17': 'P027'}, 'Friday': {'9': 'P019', '10': 'P018', '11': 'P079', '12': 'P030', '13': 'P031', '15': 'P061'}}}, {'name': 'Frank (care_assistant)', 'schedule': {'Sunday': {'12': 'P077', '13': 'P028', '14': 'P058'}, 'Monday': {'10': 'P028', '11': 'P065', '12': 'P044', '13': 'P040', '14': 'P042', '15': 'P037', '16': 'P041', '17': 'P050'}, 'Tuesday': {'10': 'P012', '12': 'P027', '13': 'P058', '14': 'P055', '15': 'P016', '16': 'P056', '17': 'P044'}, 'Wednesday': {'8': 'P055', '10': 'P046', '11': 'P065', '12': 'P025', '13': 'P077', '14': 'P010', '15': 'P011'}, 'Thursday': {'11': 'P058', '13': 'P046', '14': 'P015', '16': 'P037', '17': 'P055'}, 'Friday': {'8': 'P044', '10': 'P027', '11': 'P040', '12': 'P042', '13': 'P065', '14': 'P028', '15': 'P041', '16': 'P058', '17': 'P002'}}}, {'name': 'Carmen (doctor)', 'schedule': {'Sunday': {'10': 'P012', '11': 'P059', '13': 'P015', '14': 'P020'}, 'Monday': {'8': 'P048', '9': 'P062', '10': 'P069', '11': 'P015', '12': 'P002', '13': 'P061'}, 'Tuesday': {'8': 'P059', '9': 'P004', '10': 'P061', '11': 'P068', '12': 'P003', '13': 'P072'}, 'Wednesday': {'10': 'P051', '13': 'P011'}, 'Thursday': {'9': 'P065', '10': 'P011', '11': 'P062', '12': 'P072', '13': 'P015', '14': 'P012'}, 'Friday': {'8': 'P020', '9': 'P027', '12': 'P007', '14': 'P070'}}}, {'name': 'Ben (psychologist)', 'schedule': {'Sunday': {'9': 'P011', '10': 'P040', '11': 'P005', '12': 'P047', '13': 'P057', '16': 'P038'}, 'Monday': {'10': 'P049', '12': 'P026', '13': 'P036', '15': 'P055', '16': 'P014', '17': 'P034'}, 'Tuesday': {'9': 'P049', '10': 'P057', '11': 'P036', '12': 'P004', '13': 'P011', '14': 'P055', '15': 'P079', '16': 'P046', '17': 'P040'}, 'Wednesday': {'9': 'P017', '10': 'P079', '12': 'P004', '13': 'P049', '17': 'P036'}, 'Thursday': {'9': 'P002', '12': 'P017'}, 'Friday': {'9': 'P014', '11': 'P055', '12': 'P040', '13': 'P057', '14': 'P013', '15': 'P038', '17': 'P022'}}}, {'name': 'Karen (therapist)', 'schedule': {'Sunday': {'9': 'P004', '10': 'P062', '11': 'P078', '12': 'P044', '15': 'P028'}, 'Monday': {'8': 'P078', '10': 'P009', '12': 'P075', '13': 'P003', '15': 'P063'}, 'Tuesday': {'8': 'P004', '11': 'P009', '14': 'P063', '15': 'P003', '17': 'P075'}, 'Wednesday': {'8': 'P022', '9': 'P006', '11': 'P076', '12': 'P003', '13': 'P078', '14': 'P063'}, 'Thursday': {}, 'Friday': {'10': 'P044', '11': 'P009', '12': 'P076'}}}, {'name': 'Wendy (psychologist)', 'schedule': {'Sunday': {'9': 'P041', '11': 'P006', '12': 'P032', '13': 'P045'}, 'Monday': {'12': 'P027', '13': 'P045'}, 'Tuesday': {}, 'Wednesday': {}, 'Thursday': {'11': 'P029'}, 'Friday': {}}}, {'name': 'Hannah (care_assistant)', 'schedule': {'Sunday': {'10': 'P004', '15': 'P019', '16': 'P036'}, 'Monday': {'8': 'P060', '16': 'P030', '17': 'P057'}, 'Tuesday': {}, 'Wednesday': {'12': 'P004'}, 'Thursday': {'12': 'P078', '15': 'P060'}, 'Friday': {'10': 'P019', '12': 'P060', '13': 'P054', '17': 'P033'}}}, {'name': 'Laura (therapist)', 'schedule': {'Sunday': {'15': 'P080', '17': 'P016'}, 'Monday': {}, 'Tuesday': {'10': 'P042', '12': 'P016', '13': 'P080'}, 'Wednesday': {}, 'Thursday': {'14': 'P080', '15': 'P013'}, 'Friday': {'13': 'P013', '14': 'P005'}}}, {'name': 'Uma (doctor)', 'schedule': {'Sunday': {}, 'Monday': {}, 'Tuesday': {'12': 'P073'}, 'Wednesday': {'14': 'P005'}, 'Thursday': {'11': 'P073'}, 'Friday': {'12': 'P073'}}}, {'name': 'Noah (care_assistant)', 'schedule': {'Sunday': {'11': 'P021', '13': 'P031', '14': 'P029'}, 'Monday': {'9': 'P045', '11': 'P008', '12': 'P031', '13': 'P068', '14': 'P052', '15': 'P024', '17': 'P021'}, 'Tuesday': {'8': 'P021', '13': 'P068', '14': 'P045', '15': 'P008', '17': 'P031'}, 'Wednesday': {'9': 'P021', '12': 'P067', '13': 'P024'}, 'Thursday': {'12': 'P029', '13': 'P006', '14': 'P032'}, 'Friday': {'11': 'P067', '12': 'P021', '13': 'P006', '14': 'P068'}}}, {'name': 'Julia (doctor)', 'schedule': {'Sunday': {'14': 'P023', '16': 'P006'}, 'Monday': {}, 'Tuesday': {'13': 'P063'}, 'Wednesday': {}, 'Thursday': {}, 'Friday': {'13': 'P050'}}}, {'name': 'Nina (psychologist)', 'schedule': {'Sunday': {}, 'Monday': {'9': 'P007', '10': 'P053'}, 'Tuesday': {'12': 'P050'}, 'Wednesday': {'11': 'P053'}, 'Thursday': {'10': 'P044'}, 'Friday': {}}}, {'name': 'Fiona (care_assistant)', 'schedule': {'Sunday': {}, 'Monday': {'11': 'P074', '12': 'P020'}, 'Tuesday': {'11': 'P007', '13': 'P035'}, 'Wednesday': {'10': 'P009'}, 'Thursday': {'8': 'P007', '9': 'P069'}, 'Friday': {'9': 'P064'}}}, {'name': 'Isla (psychologist)', 'schedule': {'Sunday': {'8': 'P019', '11': 'P030', '13': 'P009'}, 'Monday': {'11': 'P033', '12': 'P018', '13': 'P012', '14': 'P051'}, 'Tuesday': {'9': 'P037', '11': 'P080', '12': 'P058', '13': 'P018', '14': 'P019'}, 'Wednesday': {'11': 'P023', '12': 'P035', '13': 'P019', '14': 'P031', '16': 'P037'}, 'Thursday': {'8': 'P080', '9': 'P031', '13': 'P009'}, 'Friday': {'9': 'P035', '10': 'P012', '11': 'P080', '12': 'P018', '13': 'P023', '14': 'P058'}}}, {'name': 'Charlie (therapist)', 'schedule': {'Sunday': {'10': 'P041'}, 'Monday': {'10': 'P059', '12': 'P073', '13': 'P038'}, 'Tuesday': {'9': 'P045', '12': 'P033', '13': 'P067'}, 'Wednesday': {'9': 'P010', '10': 'P077', '11': 'P038', '13': 'P017'}, 'Thursday': {'8': 'P020', '11': 'P041', '12': 'P039', '13': 'P038', '16': 'P035'}, 'Friday': {'8': 'P035', '9': 'P045', '12': 'P073', '14': 'P077'}}}, {'name': 'Abby (doctor)', 'schedule': {'Sunday': {'11': 'P019', '13': 'P074'}, 'Monday': {}, 'Tuesday': {'10': 'P017', '13': 'P016'}, 'Wednesday': {}, 'Thursday': {'10': 'P058', '15': 'P074'}, 'Friday': {'11': 'P016', '17': 'P074'}}}, {'name': 'Ivan (psychologist)', 'schedule': {'Sunday': {'10': 'P024', '11': 'P016', '12': 'P048'}, 'Monday': {'8': 'P016'}, 'Tuesday': {'11': 'P028', '12': 'P025', '13': 'P056'}, 'Wednesday': {'9': 'P042', '13': 'P024'}, 'Thursday': {'12': 'P048'}, 'Friday': {'12': 'P042'}}}, {'name': 'Gina (doctor)', 'schedule': {'Sunday': {'10': 'P044', '11': 'P030', '12': 'P042', '13': 'P046', '14': 'P040', '15': 'P039'}, 'Monday': {'8': 'P044', '11': 'P041', '12': 'P036', '13': 'P037', '14': 'P038', '15': 'P039', '16': 'P040'}, 'Tuesday': {'11': 'P041', '12': 'P042', '13': 'P043', '14': 'P044', '15': 'P045', '16': 'P046', '17': 'P029'}, 'Wednesday': {'11': 'P040', '12': 'P030', '13': 'P031', '14': 'P032', '15': 'P039', '16': 'P034'}, 'Thursday': {'12': 'P046', '13': 'P041', '14': 'P029'}, 'Friday': {'10': 'P038', '11': 'P044', '13': 'P036', '14': 'P042', '15': 'P033', '16': 'P046'}}}, {'name': 'Yara (nurse)', 'schedule': {'Sunday': {}, 'Monday': {'13': 'P072', '15': 'P059'}, 'Tuesday': {'9': 'P069', '13': 'P039'}, 'Wednesday': {'11': 'P069', '13': 'P080', '14': 'P053', '15': 'P072', '16': 'P066'}, 'Thursday': {'11': 'P030', '12': 'P069'}, 'Friday': {'11': 'P053', '13': 'P080', '14': 'P030', '16': 'P059'}}}, {'name': 'Harold (nurse)', 'schedule': {'Sunday': {}, 'Monday': {'11': 'P031', '14': 'P055'}, 'Tuesday': {}, 'Wednesday': {'11': 'P050', '13': 'P075', '15': 'P036'}, 'Thursday': {}, 'Friday': {'14': 'P036'}}}, {'name': 'Quinn (nurse)', 'schedule': {'Sunday': {}, 'Monday': {'11': 'P052', '14': 'P032'}, 'Tuesday': {'15': 'P068'}, 'Wednesday': {'10': 'P037'}, 'Thursday': {'9': 'P071', '10': 'P052', '15': 'P048'}, 'Friday': {}}}, {'name': 'Xander (nurse)', 'schedule': {'Sunday': {'9': 'P062', '10': 'P077', '11': 'P064'}, 'Monday': {'15': 'P056'}, 'Tuesday': {'8': 'P062', '9': 'P056', '11': 'P045', '14': 'P064'}, 'Wednesday': {'8': 'P077', '11': 'P035', '12': 'P064'}, 'Thursday': {}, 'Friday': {}}}, {'name': 'Zane (nurse)', 'schedule': {'Sunday': {}, 'Monday': {'9': 'P049', '12': 'P058', '13': 'P046', '15': 'P044', '16': 'P042'}, 'Tuesday': {'12': 'P044', '14': 'P060', '15': 'P049', '16': 'P040'}, 'Wednesday': {'9': 'P049', '12': 'P058', '14': 'P051'}, 'Thursday': {'8': 'P058', '12': 'P042', '14': 'P049', '15': 'P040', '16': 'P044'}, 'Friday': {'12': 'P060', '13': 'P074', '14': 'P067', '15': 'P073', '17': 'P058'}}}, {'name': 'Eli (therapist)', 'schedule': {'Sunday': {'12': 'P048', '13': 'P053', '14': 'P055', '15': 'P056', '16': 'P054'}, 'Monday': {'9': 'P047', '10': 'P051', '11': 'P049', '12': 'P050', '14': 'P057', '17': 'P054'}, 'Tuesday': {'10': 'P053'}, 'Wednesday': {'15': 'P058'}, 'Thursday': {'9': 'P055', '10': 'P056', '11': 'P057', '12': 'P058'}, 'Friday': {'9': 'P051', '10': 'P052', '11': 'P053', '12': 'P054', '16': 'P050', '17': 'P055'}}}, {'name': 'Bob (psychologist)', 'schedule': {'Sunday': {'9': 'P068', '10': 'P076', '12': 'P077', '13': 'P065', '14': 'P072', '15': 'P074', '17': 'P067'}, 'Monday': {'9': 'P076', '11': 'P075', '12': 'P077', '13': 'P063', '14': 'P059'}, 'Tuesday': {'8': 'P069', '9': 'P070', '10': 'P071', '11': 'P072', '12': 'P073', '13': 'P078'}, 'Wednesday': {'8': 'P064', '9': 'P065', '10': 'P066', '11': 'P067', '12': 'P072', '14': 'P071', '15': 'P076'}, 'Thursday': {'8': 'P059', '9': 'P060', '10': 'P075', '11': 'P066', '12': 'P063', '13': 'P077'}, 'Friday': {'8': 'P074', '9': 'P075', '10': 'P076', '11': 'P077', '12': 'P078', '16': 'P061'}}}]}
    result = optimize_caretaker_schedule(data)
    print(result)