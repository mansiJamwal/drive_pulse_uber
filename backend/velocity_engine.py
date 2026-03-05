import pandas as pd


def validate_data(df):

    if (df["elapsed_hours"] < 0).any():
        raise ValueError("Negative elapsed hours detected")

    if (df["cumulative_earnings"] < 0).any():
        raise ValueError("Negative earnings detected")

    # cumulative earnings should not decrease for same driver
    df = df.sort_values(["driver_id", "timestamp"])

    if (df.groupby("driver_id")["cumulative_earnings"].diff() < 0).any():
        print("Warning: cumulative earnings decreased for some drivers")

    return df


def compute_current_velocity(log):

    safe_hours = log["elapsed_hours"].replace(0, 1e-6)

    log["computed_velocity"] = (
        log["cumulative_earnings"] / safe_hours
    )

    return log


def compute_target_velocity(goals):

    goals["computed_target_velocity"] = (
        goals["target_earnings"] /
        goals["target_hours"].replace(0, 1e-6)
    )

    return goals


def merge_velocity_data(goals, log):

    merged = log.merge(
        goals[
            [
                "driver_id",
                "target_earnings",
                "target_hours",
                "computed_target_velocity"
            ]
        ],
        on="driver_id",
        how="left",
        validate="many_to_one"   
    )

    return merged


def predict_final_earnings(df):

    df["remaining_hours"] = (
        df["target_hours"] - df["elapsed_hours"]
    ).clip(lower=0)

    df["future_earnings"] = (
        df["computed_velocity"] *
        df["remaining_hours"]
    )

    df["predicted_final"] = (
        df["cumulative_earnings"] +
        df["future_earnings"]
    )

    return df


def classify_forecast(row):

    predicted = row["predicted_final"]
    target = row["target_earnings"]

    if predicted >= target * 1.1:
        return "ahead"

    elif predicted >= target * 0.9:
        return "on_track"

    else:
        return "at_risk"


def apply_forecast(df):

    df["forecast"] = df.apply(
        classify_forecast,
        axis=1
    )

    return df