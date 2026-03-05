from velocity_engine import (
    validate_data,
    compute_current_velocity,
    compute_target_velocity,
    merge_velocity_data,
    predict_final_earnings,
    apply_forecast
)

from config import DRIVERS_FILE, GOALS_FILE, VELOCITY_LOG_FILE

import pandas as pd
import os
from config import DRIVERS_FILE, GOALS_FILE

LOG_FILE = VELOCITY_LOG_FILE
OUTPUT_FILE = "generated_outputs/velocity_analysis.csv"


def run_velocity_pipeline():

    log = pd.read_csv(LOG_FILE)
    goals = pd.read_csv(GOALS_FILE)

    log = validate_data(log)

    log = compute_current_velocity(log)

    goals = compute_target_velocity(goals)

    merged = merge_velocity_data(goals, log)

    merged = predict_final_earnings(merged)

    merged = apply_forecast(merged)

    os.makedirs("generated_outputs", exist_ok=True)

    merged = merged.sort_values(["driver_id", "timestamp"])

    merged.to_csv(
        OUTPUT_FILE,
        index=False
    )

    return merged