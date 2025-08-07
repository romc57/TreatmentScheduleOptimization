from fastapi import FastAPI, Request, Query
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import os
from scheduler_faker import StrictScheduler
import optimized_scheduler
from fastapi.middleware.cors import CORSMiddleware


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # or ["http://localhost:3000"] for React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/optimize-schedule/")
async def optimize_schedule(data: str = Query(...)):
    input_json = json.loads(data)
    result = optimized_scheduler.optimize_caretaker_schedule(input_json)
    return JSONResponse(content=result)
