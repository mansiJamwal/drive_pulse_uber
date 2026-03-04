from fastapi import APIRouter
import pandas as pd
import numpy as np

from config import DRIVERS_FILE

router = APIRouter()

VELOCITY_FILE = "generated_outputs/velocity_analysis.csv"


@router.get("/driver/{driver_id}")
def get_driver_dashboard(driver_id: str):

    drivers = pd.read_csv(DRIVERS_FILE)
    velocity = pd.read_csv(VELOCITY_FILE)

    # driver profile
    driver_profile = drivers[drivers["driver_id"] == driver_id]

    if driver_profile.empty:
        return {"message": "Driver not found"}

    driver_profile = driver_profile.iloc[0].to_dict()

    # velocity data
    driver_velocity = velocity[velocity["driver_id"] == driver_id]

    if driver_velocity.empty:
        return {"message": "No velocity data for this driver"}

    # clean invalid numbers
    driver_velocity = driver_velocity.replace([np.inf, -np.inf], np.nan)
    driver_velocity = driver_velocity.fillna(0)

    latest = driver_velocity.iloc[-1].to_dict()

    return {

        "driver_profile": driver_profile,

        "current_status": {

            "current_earnings": float(latest["cumulative_earnings"]),
            "hours_worked": float(latest["elapsed_hours"]),
            "computed_velocity": float(latest["computed_velocity"]),
            "original_velocity": float(latest.get("current_velocity", 0)),
            "target_velocity": float(latest.get("computed_target_velocity", 0)),
            "predicted_final": float(latest["predicted_final"]),
            "forecast": latest["forecast"]

        },

        "timeline": driver_velocity.to_dict(orient="records")

    }