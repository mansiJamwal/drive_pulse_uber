from fastapi import APIRouter
import pandas as pd
import numpy as np
from pydantic import BaseModel
import uuid
from datetime import datetime

from config import DRIVERS_FILE, GOALS_FILE
from run_velocity_pipeline import run_velocity_pipeline

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

    goals = pd.read_csv(GOALS_FILE)

    goals["goal_timestamp"] = pd.to_datetime(
        goals["date"] + " " + goals["shift_start_time"],
        format='%Y-%m-%d %H:%M:%S',
        errors='coerce'
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

    velocity = velocity.replace([np.inf, -np.inf], np.nan)
    velocity = velocity.fillna(0)

    driver_velocity = velocity[velocity["driver_id"] == driver_id].copy()

    if driver_velocity.empty:
        # No velocity history, but calculate target_velocity from goal if available
        if target_earnings is not None and target_hours is not None:
            target_velocity = target_earnings / target_hours
        else:
            target_velocity = 0

        return {
            "driver_profile": driver_profile,
            "goal": goal,
            "current_status": {
                "current_earnings": 0,
                "hours_worked": 0,
                "computed_velocity": 0,
                "target_velocity": target_velocity,
                "predicted_final": None,
                "forecast": "no_data"
            },
            "timeline": []
        }

    # -------------------------
    # Dynamic Target Velocity
    # -------------------------

    if target_earnings is not None:

        driver_velocity["remaining_hours"] = (
            target_hours - driver_velocity["elapsed_hours"]
        ).clip(lower=0)

        driver_velocity["remaining_earnings"] = (
            target_earnings - driver_velocity["cumulative_earnings"]
        ).clip(lower=0)

        driver_velocity["computed_target_velocity"] = (
            driver_velocity["remaining_earnings"] /
            driver_velocity["remaining_hours"].replace(0, np.nan)
        )

        driver_velocity["computed_target_velocity"] = (
            driver_velocity["computed_target_velocity"]
            .replace([np.inf, -np.inf], np.nan)
            .fillna(0)
        )

    latest = driver_velocity.iloc[-1]

    current_earnings = float(latest["cumulative_earnings"])
    hours_worked = float(latest["elapsed_hours"])
    computed_velocity = float(latest["computed_velocity"])

    if target_earnings is not None:

        remaining_hours = max(target_hours - hours_worked, 0)

        target_velocity = (
            (target_earnings - current_earnings) / remaining_hours
            if remaining_hours > 0 else 0
        )

        predicted_final = current_earnings + (
            computed_velocity * remaining_hours
        )

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
            "target_velocity": target_velocity,
            "predicted_final": predicted_final,
            "forecast": forecast
        },
        "timeline": driver_velocity.to_dict(orient="records")
    }


@router.post("/driver/{driver_id}/goal")
def update_driver_goal(driver_id: str, goal: GoalUpdate):

    goals = pd.read_csv(GOALS_FILE)

    goal_id = f"GOAL{uuid.uuid4().hex[:6].upper()}"

    new_row = {
        "goal_id": goal_id,
        "driver_id": driver_id,
        "date": datetime.now().strftime("%Y-%m-%d"),
        "shift_start_time": goal.shift_start_time,
        "shift_end_time": goal.shift_end_time,
        "target_earnings": goal.target_earnings,
        "target_hours": goal.target_hours
    }

    goals = pd.concat(
        [goals, pd.DataFrame([new_row])],
        ignore_index=True
    )

    goals.to_csv(GOALS_FILE, index=False)

    
    run_velocity_pipeline(driver_id)

    return {
        "message": "Goal updated successfully",
        "goal_id": goal_id
    }


@router.get("/driver/{driver_id}/trips")
def get_driver_trips(driver_id: str):
    """Get trip history for a driver (for today)"""
    
    try:
        trips = pd.read_csv("../data/trips/trips.csv")
        trip_summaries = pd.read_csv("../data/processed_outputs/trip_summaries.csv")
        
        # Filter by driver_id
        driver_trips = trips[trips["driver_id"] == driver_id].copy()
        
        if driver_trips.empty:
            return {"trips": []}
        
        # Merge with trip summaries for quality ratings
        driver_trips = driver_trips.merge(
            trip_summaries[["trip_id", "stress_score", "trip_quality_rating"]],
            on="trip_id",
            how="left"
        )
        
        # Rename columns to match frontend expectations
        column_mapping = {
            "duration_min": "duration",
            "distance_km": "distance",
            "trip_status": "status"
        }
        driver_trips = driver_trips.rename(columns=column_mapping)
        
        # Sort by start_time descending (latest first)
        driver_trips = driver_trips.sort_values("start_time", ascending=False)
        
        # Convert to list of dicts
        trips_list = driver_trips.to_dict(orient="records")
        
        return {"trips": trips_list}
    
    except Exception as e:
        return {"trips": [], "error": str(e)}

@router.get("/driver/{driver_id}/progress")
def get_driver_progress(driver_id: str):

    drivers = pd.read_csv(DRIVERS_FILE)
    velocity = pd.read_csv(VELOCITY_FILE)
    goals = pd.read_csv(GOALS_FILE)

    goals["goal_timestamp"] = pd.to_datetime(
        goals["date"] + " " + goals["shift_start_time"],
        format='%Y-%m-%d %H:%M:%S',
        errors='coerce'
    )

    goals = goals.sort_values("goal_timestamp")
    goals = goals.groupby("driver_id").tail(1)

    goal_row = goals[goals["driver_id"] == driver_id]

    if goal_row.empty:
        return {
            "current": 0,
            "goal": 0,
            "progress_percent": 0
        }

    goal = goal_row.iloc[0]

    target_earnings = float(goal["target_earnings"])

    driver_velocity = velocity[velocity["driver_id"] == driver_id]

    if driver_velocity.empty:

        return {
            "current": 0,
            "goal": target_earnings,
            "progress_percent": 0
        }

    latest = driver_velocity.iloc[-1]

    current_earnings = float(latest["cumulative_earnings"])

    progress_percent = (
        (current_earnings / target_earnings) * 100
        if target_earnings > 0
        else 0
    )

    progress_percent =progress_percent

    return {
        "current": current_earnings,
        "goal": target_earnings,
        "progress_percent": round(progress_percent, 1)
    }