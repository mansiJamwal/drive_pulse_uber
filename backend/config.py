import os

# backend directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# project root (one level above backend)
PROJECT_ROOT = os.path.dirname(BASE_DIR)

# data directory
DATA_FOLDER = os.path.join(PROJECT_ROOT, "data")

# input files
DRIVERS_FILE = os.path.join(DATA_FOLDER, "drivers", "drivers.csv")
GOALS_FILE = os.path.join(DATA_FOLDER, "earnings", "driver_goals.csv")
VELOCITY_LOG_FILE = os.path.join(DATA_FOLDER, "earnings", "earnings_velocity_log.csv")

TRIPS_FILE = os.path.join(DATA_FOLDER, "trips", "trips.csv")
TRIP_SUMMARIES_FILE = os.path.join(DATA_FOLDER, "processed_outputs", "trip_summaries.csv")

# generated outputs (inside backend)
GENERATED_FOLDER = os.path.join(BASE_DIR, "generated_outputs")
os.makedirs(GENERATED_FOLDER, exist_ok=True)

OUTPUT_FILE = os.path.join(GENERATED_FOLDER, "velocity_analysis.csv")