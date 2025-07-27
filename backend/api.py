from fastapi import FastAPI
from fastapi.responses import JSONResponse
import os
from scheduler_faker import StrictScheduler, enforce_consistent_caretakers_per_profession
import optimized_scheduler

app = FastAPI()

@app.get("/faker-schedule/")
def get_faker_schedule():
    scheduler = StrictScheduler(num_caretakers=30, num_patients=80)
    scheduler.generate_caretakers()
    scheduler.assign_patients()
    enforce_consistent_caretakers_per_profession(scheduler)
    caretaker_json, patient_json = scheduler.export_json()
    return {"caretaker": caretaker_json, "patient": patient_json}

@app.get("/optimized-schedule/")
def get_optimized_schedule():
    # This assumes optimized_scheduler.py writes caretaker_schedule.json and patient_schedule.json
    # and that input Excel is already present as caretaker_schedule.xlsx
    os.system("python3 optimized_scheduler.py")
    try:
        with open("caretaker_schedule.json") as f:
            caretaker_json = f.read()
        with open("patient_schedule.json") as f:
            patient_json = f.read()
        return JSONResponse(content={
            "caretaker": optimized_scheduler.json.loads(caretaker_json),
            "patient": optimized_scheduler.json.loads(patient_json)
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})
