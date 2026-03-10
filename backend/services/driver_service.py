import pandas as pd
import numpy as np
import uuid
from datetime import datetime
import time
import os

from config import (
    DRIVERS_FILE,
    GOALS_FILE,
    OUTPUT_FILE,
    TRIPS_FILE,
    TRIP_SUMMARIES_FILE
)

from run_velocity_pipeline import run_velocity_pipeline


def get_driver_dashboard_service(driver_id):

    drivers = pd.read_csv(DRIVERS_FILE)
    velocity = pd.read_csv(OUTPUT_FILE)

    driver_profile = drivers[drivers["driver_id"] == driver_id]

    if driver_profile.empty:
        return {"message": "Driver not found"}

    driver_profile = driver_profile.iloc[0].to_dict()

    goals = pd.read_csv(GOALS_FILE)

    goals["goal_timestamp"] = pd.to_datetime(
        goals["date"] + " " + goals["shift_start_time"],
        format="%Y-%m-%d %H:%M:%S",
        errors="coerce"
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





def update_driver_goal_service(driver_id, goal):

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

    goals = pd.concat([goals, pd.DataFrame([new_row])], ignore_index=True)
    goals.to_csv(GOALS_FILE, index=False)


    run_velocity_pipeline(driver_id)

    return {
        "message": "Goal updated successfully",
        "goal_id": goal_id
    }

def get_driver_trips_service(driver_id):

    trips = pd.read_csv(TRIPS_FILE)
    trip_summaries = pd.read_csv(TRIP_SUMMARIES_FILE)

    driver_trips = trips[trips["driver_id"] == driver_id].copy()

    if driver_trips.empty:
        return {"trips": []}

    driver_trips = driver_trips.merge(
        trip_summaries[["trip_id", "stress_score", "trip_quality_rating"]],
        on="trip_id",
        how="left"
    )

    driver_trips = driver_trips.rename(columns={
        "duration_min": "duration",
        "distance_km": "distance",
        "trip_status": "status"
    })

    driver_trips = driver_trips.sort_values("start_time", ascending=False)

    return {"trips": driver_trips.to_dict(orient="records")}


def get_driver_progress_service(driver_id):

    velocity = pd.read_csv(OUTPUT_FILE)
    goals = pd.read_csv(GOALS_FILE)

    goals["goal_timestamp"] = pd.to_datetime(
        goals["date"] + " " + goals["shift_start_time"],
        errors="coerce"
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

    target_earnings = float(goal_row.iloc[0]["target_earnings"])

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

    return {
        "current": current_earnings,
        "goal": target_earnings,
        "progress_percent": round(progress_percent, 1)
    }