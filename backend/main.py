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

    # Ensure output directory exists
    os.makedirs("generated_outputs", exist_ok=True)

    merged[output_cols].to_csv(
        OUTPUT_FILE,
        index=False
    )

    return merged


if __name__ == "__main__":

    df = run_velocity_pipeline()

    print(df.head())