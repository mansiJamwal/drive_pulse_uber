from fastapi import APIRouter
import pandas as pd
import numpy as np

from config import DRIVERS_FILE, GOALS_FILE

router = APIRouter()

VELOCITY_FILE = "generated_outputs/velocity_analysis.csv"


@router.get("/driver/{driver_id}")
def get_driver_dashboard(driver_id: str):

    drivers = pd.read_csv(DRIVERS_FILE)
    velocity = pd.read_csv(VELOCITY_FILE)
    driver_profile = drivers[drivers["driver_id"] == driver_id]

    if driver_profile.empty:
        return {"message": "Driver not found"}

    driver_profile = driver_profile.iloc[0].to_dict()

    # load goals
    goals = pd.read_csv(GOALS_FILE)

    # keep only one goal per driver
    goals = goals.drop_duplicates(subset=["driver_id"], keep="last")

    # velocity data
    driver_velocity = velocity[velocity["driver_id"] == driver_id]

    # clean dataset
    velocity = velocity.replace([np.inf, -np.inf], np.nan)
    velocity = velocity.fillna(0)

    goal_row = goals[goals["driver_id"] == driver_id]
    # print(f"Goal row for driver {driver_id}: {goal_row}")
    if not goal_row.empty:

        raw_goal = goal_row.iloc[0]

        target_earnings = float(raw_goal["target_earnings"])
        # print(f"Raw target earnings for driver {driver_id}: {raw_goal['target_earnings']}")
        target_hours = float(raw_goal["target_hours"])

        goal = {
            "target_earnings": target_earnings,
            "target_hours": target_hours
        }
        # print(f"Goal for driver {driver_id}: {goal}")
    else:

        goal = None
        target_earnings = None
        target_hours = None


    if driver_velocity.empty:

        mean_computed_velocity = float(
            velocity["computed_velocity"].mean()
        ) if not velocity.empty else 0.0

        mean_target_velocity = float(
            velocity["computed_target_velocity"].mean()
        ) if not velocity.empty else 0.0

        current_status = {
            "current_earnings": 0.0,
            "hours_worked": 0.0,
            "computed_velocity": mean_computed_velocity,
            "original_velocity": 0.0,
            "target_velocity": mean_target_velocity,
            "predicted_final": None,
            "forecast": "no_data"
        }

        return {
            "driver_profile": driver_profile,
            "goal": goal,
            "current_status": current_status,
            "timeline": []
        }

    

    driver_velocity = driver_velocity.replace([np.inf, -np.inf], np.nan)
    driver_velocity = driver_velocity.fillna(0)

    latest = driver_velocity.iloc[-1].to_dict()

    
    current_earnings = float(latest.get("cumulative_earnings", 0))
    hours_worked = float(latest.get("elapsed_hours", 0))
    computed_velocity = float(latest.get("computed_velocity", 0))

    original_velocity = (
        float(latest.get("current_velocity", 0))
        if latest.get("current_velocity") is not None
        else 0.0
    )

    target_velocity = float(latest.get("computed_target_velocity", 0))

    
    if current_earnings == 0:

        predicted_final = None
        forecast = "no_data"

    else:

        predicted_final = float(latest.get("predicted_final", 0))
        forecast = latest.get("forecast", "no_data")

    return {

        "driver_profile": driver_profile,

        "goal": goal,

        "current_status": {

            "current_earnings": current_earnings,
            "hours_worked": hours_worked,
            "computed_velocity": computed_velocity,
            "original_velocity": original_velocity,
            "target_velocity": target_velocity,
            "predicted_final": predicted_final,
            "forecast": forecast

        },

        "timeline": driver_velocity.to_dict(orient="records")

    }