import pandas as pd
from config import DRIVERS_FILE, GOALS_FILE, VELOCITY_LOG_FILE


def load_data():

    drivers = pd.read_csv(DRIVERS_FILE)
    drivers = drivers.drop_duplicates(subset=["driver_id"])

    goals = pd.read_csv(GOALS_FILE)
    goals = goals.drop_duplicates(subset=["driver_id"])

    velocity_log = pd.read_csv(VELOCITY_LOG_FILE)

    velocity_log["timestamp"] = pd.to_datetime(velocity_log["timestamp"])

    # enforce one record per driver per timestamp
    velocity_log = velocity_log.sort_values("timestamp")

    velocity_log = velocity_log.drop_duplicates(
        subset=["driver_id", "timestamp"],
        keep="last"
    )

    return drivers, goals, velocity_log