import pandas as pd
from config import DRIVERS_FILE, GOALS_FILE, VELOCITY_LOG_FILE


def load_data():

    drivers = pd.read_csv(DRIVERS_FILE)

    goals = pd.read_csv(GOALS_FILE)

    velocity_log = pd.read_csv(VELOCITY_LOG_FILE)

    velocity_log["timestamp"] = pd.to_datetime(
        velocity_log["timestamp"]
    )

    velocity_log = velocity_log.sort_values("timestamp")

    return drivers, goals, velocity_log