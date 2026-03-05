from fastapi import APIRouter
import pandas as pd
import numpy as np
from pydantic import BaseModel
import uuid
from datetime import datetime

from config import DRIVERS_FILE, GOALS_FILE

router = APIRouter()

VELOCITY_FILE = "generated_outputs/velocity_analysis.csv"


class GoalUpdate(BaseModel):
    shift_start_time: str
    shift_end_time: str
    target_earnings: float
    target_hours: float


@router.get("/driver/{driver_id}")
def get_driver_dashboard(driver_id: str):

    drivers = pd.read_csv(DRIVERS_FILE)
    velocity = pd.read_csv(VELOCITY_FILE)

    driver_profile = drivers[drivers["driver_id"] == driver_id]

    if driver_profile.empty:
        return {"message": "Driver not found"}

    driver_profile = driver_profile.iloc[0].to_dict()

    # -------------------------
    # Load Goals
    # -------------------------

    goals = pd.read_csv(GOALS_FILE)

    goals["goal_timestamp"] = pd.to_datetime(
        goals["date"] + " " + goals["shift_start_time"]
    )

    goals = goals.sort_values("goal_timestamp")
    goals = goals.groupby("driver_id").tail(1)

    goal_row = goals[goals["driver_id"] == driver_id]

    if not goal_row.empty:

        raw_goal = goal_row.iloc[0]

        target_earnings = float(raw_goal["target_earnings"])
        target_hours = float(raw_goal["target_hours"])

        goal = {
            "shift_start_time": str(raw_goal["shift_start_time"])[:5],
            "shift_end_time": str(raw_goal["shift_end_time"])[:5],
            "target_earnings": target_earnings,
            "target_hours": target_hours
        }

    else:

        goal = None
        target_earnings = None
        target_hours = None

    # -------------------------
    # Velocity
    # -------------------------

    velocity = velocity.replace([np.inf, -np.inf], np.nan)
    velocity = velocity.fillna(0)

    driver_velocity = velocity[velocity["driver_id"] == driver_id].copy()

    if driver_velocity.empty:

        mean_velocity = float(
            velocity["computed_velocity"].mean()
        ) if not velocity.empty else 0.0

        return {
            "driver_profile": driver_profile,
            "goal": goal,
            "current_status": {
                "current_earnings": 0.0,
                "hours_worked": 0.0,
                "computed_velocity": mean_velocity,
                "original_velocity": 0.0,
                "target_velocity": 0.0,
                "predicted_final": None,
                "forecast": "no_data"
            },
            "timeline": []
        }

    driver_velocity = driver_velocity.replace([np.inf, -np.inf], np.nan)
    driver_velocity = driver_velocity.fillna(0)

    # ------------------------------------------------
    # CONSTANT TARGET VELOCITY FOR GRAPH
    # ------------------------------------------------

    if target_earnings is not None and target_hours is not None:

        target_velocity_constant = (
            target_earnings / target_hours
            if target_hours > 0 else 0
        )

        driver_velocity["computed_target_velocity"] = target_velocity_constant

    else:

        driver_velocity["computed_target_velocity"] = 0

    # ------------------------------------------------

    latest = driver_velocity.iloc[-1]

    current_earnings = float(latest.get("cumulative_earnings", 0))
    hours_worked = float(latest.get("elapsed_hours", 0))
    computed_velocity = float(latest.get("computed_velocity", 0))
    original_velocity = float(latest.get("current_velocity", 0))

    # -------------------------
    # Target Velocity
    # -------------------------

    if target_earnings is not None and target_hours is not None:

        target_velocity = (
            target_earnings / target_hours
            if target_hours > 0 else 0
        )

        remaining_hours = max(target_hours - hours_worked, 0)

        predicted_final = current_earnings + (computed_velocity * remaining_hours)

        if predicted_final >= target_earnings * 1.1:
            forecast = "ahead"
        elif predicted_final >= target_earnings * 0.9:
            forecast = "on_track"
        else:
            forecast = "at_risk"

    else:

        target_velocity = 0
        predicted_final = None
        forecast = "no_data"

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


@router.post("/driver/{driver_id}/goal")
def update_driver_goal(driver_id: str, goal: GoalUpdate):

    goals = pd.read_csv(GOALS_FILE)
    velocity = pd.read_csv(VELOCITY_FILE)

    driver_goals = goals[goals["driver_id"] == driver_id]

    # ---------------------
    # NO PREVIOUS GOAL
    # ---------------------

    if driver_goals.empty:

        shift_start = goal.shift_start_time
        shift_end = goal.shift_end_time
        target_earnings = goal.target_earnings
        target_hours = goal.target_hours

        current_earnings = 0.0
        current_hours = 0.0
        earnings_velocity = 0.0

    # ---------------------
    # PREVIOUS GOAL EXISTS
    # ---------------------

    else:

        latest_goal = driver_goals.iloc[-1]

        shift_start = goal.shift_start_time or latest_goal["shift_start_time"]
        shift_end = goal.shift_end_time or latest_goal["shift_end_time"]
        target_earnings = goal.target_earnings or latest_goal["target_earnings"]
        target_hours = goal.target_hours or latest_goal["target_hours"]

        driver_velocity = velocity[velocity["driver_id"] == driver_id]

        if driver_velocity.empty:

            current_earnings = 0.0
            current_hours = 0.0

        else:

            latest_v = driver_velocity.iloc[-1]

            current_earnings = float(latest_v.get("cumulative_earnings", 0))
            current_hours = float(latest_v.get("elapsed_hours", 0))

        earnings_velocity = (
            current_earnings / current_hours
            if current_hours > 0 else 0
        )

    # ---------------------
    # Forecast
    # ---------------------

    remaining_hours = max(target_hours - current_hours, 0)

    predicted_final = current_earnings + earnings_velocity * remaining_hours

    if predicted_final >= target_earnings * 1.1:
        forecast = "ahead"
    elif predicted_final >= target_earnings * 0.9:
        forecast = "on_track"
    else:
        forecast = "at_risk"

    status = "achieved" if current_earnings >= target_earnings else "in_progress"

    goal_id = f"GOAL{uuid.uuid4().hex[:6].upper()}"

    new_row = {

        "goal_id": goal_id,
        "driver_id": driver_id,
        "date": datetime.now().strftime("%Y-%m-%d"),

        "shift_start_time": shift_start,
        "shift_end_time": shift_end,

        "target_earnings": target_earnings,
        "target_hours": target_hours,

        "current_earnings": current_earnings,
        "current_hours": current_hours,

        "status": status,
        "earnings_velocity": earnings_velocity,
        "goal_completion_forecast": forecast
    }

    goals = pd.concat([goals, pd.DataFrame([new_row])], ignore_index=True)

    goals.to_csv(GOALS_FILE, index=False)

    return {
        "message": "Goal updated successfully",
        "goal_id": goal_id,
        "status": status,
        "forecast": forecast
    }