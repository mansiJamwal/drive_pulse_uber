from velocity_engine import (
    validate_data,
    compute_current_velocity,
    compute_target_velocity,
    merge_velocity_data,
    predict_final_earnings,
    apply_forecast
)

from config import GOALS_FILE, VELOCITY_LOG_FILE

import pandas as pd
import os

LOG_FILE = VELOCITY_LOG_FILE
OUTPUT_FILE = "generated_outputs/velocity_analysis.csv"


def run_velocity_pipeline(driver_id: str = None):

    log = pd.read_csv(LOG_FILE)
    goals = pd.read_csv(GOALS_FILE)

    # -----------------------------
    # Recompute only one driver
    # -----------------------------

    if driver_id is not None:
        log = log[log["driver_id"] == driver_id]
        goals = goals[goals["driver_id"] == driver_id]

    if log.empty:
        return None

    log = validate_data(log)

    log = compute_current_velocity(log)

    goals = compute_target_velocity(goals)

    merged = merge_velocity_data(goals, log)

    merged = predict_final_earnings(merged)

    merged = apply_forecast(merged)

    os.makedirs("generated_outputs", exist_ok=True)

    merged = merged.sort_values(["driver_id", "timestamp"])

    # -----------------------------
    # Update only this driver data
    # -----------------------------

    if os.path.exists(OUTPUT_FILE):

        existing = pd.read_csv(OUTPUT_FILE)

        if driver_id is not None:
            existing = existing[existing["driver_id"] != driver_id]

        merged = pd.concat([existing, merged], ignore_index=True)

    merged.to_csv(OUTPUT_FILE, index=False)

    return merged