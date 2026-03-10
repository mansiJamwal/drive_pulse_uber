from data_loader import load_data
from velocity_engine import (
    validate_data,
    compute_current_velocity,
    compute_target_velocity,
    merge_velocity_data,
    predict_final_earnings,
    apply_forecast
)

from config import OUTPUT_FILE
import os


from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from stress_detection import run_stress_detection

from routes.velocity_routes import router as velocity_router
from routes.driver_routes import router as driver_router
from routes.stress_routes import router as stress_router
from routes.pulse_routes import router as pulse_router

def run_velocity_pipeline():

    drivers, goals, log = load_data()

    log = validate_data(log)

    log = compute_current_velocity(log)

    goals = compute_target_velocity(goals)

    merged = merge_velocity_data(goals, log)

    merged = predict_final_earnings(merged)

    merged = apply_forecast(merged)

    output_cols = [
        "driver_id",
        "timestamp",
        "cumulative_earnings",
        "elapsed_hours",
        "computed_velocity",
        "computed_target_velocity",
        "remaining_hours",
        "predicted_final",
        "forecast"
    ]

    # os.makedirs("generated_outputs", exist_ok=True)

    merged = merged.sort_values(["driver_id", "timestamp"])

    merged[output_cols].to_csv(
        OUTPUT_FILE,
        index=False
    )

    return merged



@asynccontextmanager
async def lifespan(app: FastAPI):
    run_velocity_pipeline()
    run_stress_detection()
    yield



app = FastAPI(title="Driver Velocity API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(velocity_router)
app.include_router(driver_router)
app.include_router(stress_router)
app.include_router(pulse_router)


if __name__ == "__main__":

    df = run_velocity_pipeline()
    print(df.head())

    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)