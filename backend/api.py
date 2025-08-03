from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from scheduler_faker import StrictScheduler, enforce_consistent_caretakers_per_profession
import optimized_scheduler

app = FastAPI()

@app.get("/optimize-schedule/")
async def optimize_schedule(data: str = Query(...)):
    input_json = json.loads(data)
    result = optimized_scheduler.optimize_caretaker_schedule(input_json)
    # Always wrap result in a dict for JSONResponse
    return JSONResponse(content={"caretakers": result})
