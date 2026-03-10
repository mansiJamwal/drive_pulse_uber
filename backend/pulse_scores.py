import pandas as pd
import os
import math

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ACCEL_FILE = os.path.join(BASE_DIR, "data", "sensor_data", "accelerometer_data.csv")
AUDIO_FILE = os.path.join(BASE_DIR, "data", "sensor_data", "audio_intensity_data.csv")
TRIPS_FILE = os.path.join(BASE_DIR, "data", "trips", "trips.csv")

OUTPUT_FILE = os.path.join(BASE_DIR, "backend", "generated_outputs", "pulse_scores.csv")



def calculate_motion_score(ax, ay):

    if pd.isna(ax) or pd.isna(ay):
        return 0

    magnitude = math.sqrt(ax**2 + ay**2)

    score = min(magnitude / 7, 1)

    return round(score, 3)




def calculate_audio_score(db, classification, duration):

    if pd.isna(db):
        return 0

    classification = str(classification).lower()

    classification_map = {
        "quiet": 0.05,
        "normal": 0.1,
        "conversation": 0.25,
        "loud": 0.45,
        "very_loud": 0.65,
        "argument": 0.95
    }

    class_score = classification_map.get(classification, 0.1)

    loudness_component = min(max((db - 65) / 35, 0), 1)
    duration_component = min((duration or 0) / 90, 1)

    audio_score = (
        0.5 * class_score +
        0.3 * loudness_component +
        0.2 * duration_component
    )

    return round(audio_score, 3)



def generate_pulse_scores():

    accel = pd.read_csv(ACCEL_FILE)
    audio = pd.read_csv(AUDIO_FILE)
    trips = pd.read_csv(TRIPS_FILE)

    accel["timestamp"] = pd.to_datetime(accel["timestamp"])
    audio["timestamp"] = pd.to_datetime(audio["timestamp"])

    accel = accel.merge(trips[["trip_id", "driver_id"]], on="trip_id", how="left")
    audio = audio.merge(trips[["trip_id", "driver_id"]], on="trip_id", how="left")

    # motion scores
    accel["motion_score"] = accel.apply(
        lambda r: calculate_motion_score(r["accel_x"], r["accel_y"]), axis=1
    )

    # audio scores
    audio["audio_score"] = audio.apply(
        lambda r: calculate_audio_score(
            r["audio_level_db"],
            r["audio_classification"],
            r["sustained_duration_sec"]
        ),
        axis=1
    )

    accel_scores = accel[["trip_id", "driver_id", "timestamp", "motion_score"]]
    audio_scores = audio[["trip_id", "driver_id", "timestamp", "audio_score"]]

    merged = pd.merge(
        accel_scores,
        audio_scores,
        on=["trip_id", "driver_id", "timestamp"],
        how="outer"
    )

    merged["motion_score"] = merged["motion_score"].fillna(0)
    merged["audio_score"] = merged["audio_score"].fillna(0)

    merged = merged.sort_values("timestamp")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    merged.to_csv(OUTPUT_FILE, index=False)

    print(f"Saved {len(merged)} pulse scores → {OUTPUT_FILE}")


if __name__ == "__main__":
    generate_pulse_scores()