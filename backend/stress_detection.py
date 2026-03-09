import pandas as pd
import os
import math


BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ACCEL_FILE = os.path.join(BASE_DIR, "data", "sensor_data", "accelerometer_data.csv")
AUDIO_FILE = os.path.join(BASE_DIR, "data", "sensor_data", "audio_intensity_data.csv")
TRIPS_FILE = os.path.join(BASE_DIR, "data", "trips", "trips.csv")

OUTPUT_FILE = os.path.join(BASE_DIR, "backend", "generated_outputs", "flagged_moments.csv")


def load_sensor_data():

    accel = pd.read_csv(ACCEL_FILE)
    audio = pd.read_csv(AUDIO_FILE)
    trips = pd.read_csv(TRIPS_FILE)

    accel["timestamp"] = pd.to_datetime(accel["timestamp"])
    audio["timestamp"] = pd.to_datetime(audio["timestamp"])

    audio["audio_level_db"] = pd.to_numeric(audio["audio_level_db"], errors="coerce")
    audio["sustained_duration_sec"] = pd.to_numeric(audio["sustained_duration_sec"], errors="coerce")

    accel = accel.merge(trips[["trip_id", "driver_id"]], on="trip_id", how="left")
    audio = audio.merge(trips[["trip_id", "driver_id"]], on="trip_id", how="left")

    return accel, audio


def calculate_motion_score(ax, ay):

    if pd.isna(ax) or pd.isna(ay):
        return 0.05

    magnitude = math.sqrt(ax**2 + ay**2)

    score = min(magnitude / 7, 1)

    return round(score, 2)



def detect_motion_events(accel_df):

    motion_events = []

    for _, row in accel_df.iterrows():

        ax = row["accel_x"]
        ay = row["accel_y"]

        motion_score = calculate_motion_score(ax, ay)

        flag_type = None
        motion_context = "normal driving"

        if motion_score > 0.45 or abs(ax) > 2.5 or abs(ay) > 2.8:

            if abs(ax) > 3.5:
                flag_type = "harsh_braking"
                motion_context = "harsh braking detected"

            elif abs(ax) > 2.5:
                flag_type = "moderate_brake"
                motion_context = "moderate braking"

            elif abs(ay) > 3:
                flag_type = "sharp_turn"
                motion_context = "sharp turn"

            else:
                flag_type = "aggressive_motion"
                motion_context = "unstable driving motion"

        motion_events.append({
    "trip_id": row["trip_id"],
    "driver_id": row["driver_id"],
    "timestamp": row["timestamp"],
    "elapsed_seconds": row["elapsed_seconds"],
    "flag_type": flag_type if flag_type else "normal_motion",
    "motion_score": motion_score,
    "audio_score": 0.05,
    "motion_context": motion_context,
    "audio_context": "normal"
})
    return motion_events


def calculate_audio_score(audio_level_db, audio_classification, duration):

    if pd.isna(audio_level_db):
        return 0.05

    if pd.isna(duration):
        duration = 0

    classification = str(audio_classification).lower()

    classification_map = {
        "quiet": 0.05,
        "normal": 0.1,
        "conversation": 0.25,
        "loud": 0.45,
        "very_loud": 0.65,
        "argument": 0.95
    }

    classification_component = classification_map.get(classification, 0.1)

    loudness_component = min(max((audio_level_db - 65) / 35, 0), 1)
    duration_component = min(duration / 90, 1)
    spike_component = min(max((audio_level_db - 80) / 20, 0), 1)

    audio_score = (
        0.35 * classification_component +
        0.30 * loudness_component +
        0.20 * duration_component +
        0.15 * spike_component
    )

    return round(audio_score, 2)


def detect_audio_events(audio_df):

    audio_events = []

    for _, row in audio_df.iterrows():

        classification = str(row["audio_classification"]).lower()

        audio_score = calculate_audio_score(
            row["audio_level_db"],
            classification,
            row["sustained_duration_sec"]
        )

        flag_type = None
        audio_context = "normal cabin sound"

        if audio_score > 0.40 or row["audio_level_db"] > 80:

            if classification == "argument":
                flag_type = "conflict_moment"
                audio_context = "argument detected"

            elif row["audio_level_db"] > 85:
                flag_type = "audio_spike"
                audio_context = "very loud cabin noise"

            elif row["sustained_duration_sec"] > 30 and row["audio_level_db"] > 75:
                flag_type = "sustained_stress"
                audio_context = "sustained elevated audio"

            else:
                flag_type = "elevated_audio"
                audio_context = "elevated cabin noise"

        audio_events.append({
    "trip_id": row["trip_id"],
    "driver_id": row["driver_id"],
    "timestamp": row["timestamp"],
    "elapsed_seconds": row["elapsed_seconds"],
    "flag_type": flag_type if flag_type else "normal_audio",
    "motion_score": 0.05,
    "audio_score": audio_score,
    "motion_context": "normal",
    "audio_context": audio_context
})

    return audio_events


def get_severity(score):

    if score >= 0.75:
        return "high"
    elif score >= 0.5:
        return "medium"
    else:
        return "low"


def combine_events(motion_events, audio_events):

    combined = []
    flag_counter = 1

    all_events = motion_events + audio_events
    df = pd.DataFrame(all_events)

    if df.empty:
        return []

    # sort events
    df = df.sort_values(["trip_id", "timestamp"])

    for trip_id, trip_df in df.groupby("trip_id"):

        trip_df = trip_df.sort_values("timestamp")
        trip_df = trip_df.set_index("timestamp")

        # rolling window (30 seconds)
        trip_df["motion_roll"] = trip_df["motion_score"].rolling("30s").max()
        trip_df["audio_roll"] = trip_df["audio_score"].rolling("30s").max()

        for ts, row in trip_df.iterrows():

            motion_score = row["motion_roll"]
            audio_score = row["audio_roll"]

            combined_score = round((0.6 * motion_score + 0.4 * audio_score), 2)

            severity = get_severity(combined_score)

            context = f"Motion score={motion_score} | Audio score={audio_score}"

            if motion_score > 0.35 or audio_score > 0.35:

                combined.append({
                    "flag_id": f"FLAG{flag_counter:03}",
                    "trip_id": trip_id,
                    "driver_id": row["driver_id"],
                    "timestamp": ts,
                    "elapsed_seconds": row["elapsed_seconds"],
                    "flag_type": "stress_window",
                    "severity": severity,
                    "motion_score": motion_score,
                    "audio_score": audio_score,
                    "combined_score": combined_score,
                    "explanation": "Motion and/or audio exceeded stress threshold within 30s window",
                    "context": context
                })

                flag_counter += 1

    return combined

def save_flagged_moments(events):

    df = pd.DataFrame(events)

    df = df.sort_values("timestamp")

    df = df.replace([float("inf"), float("-inf")], None)
    df = df.where(pd.notnull(df), None)

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    df.to_csv(OUTPUT_FILE, index=False)

    print(f"Saved {len(df)} flagged events → {OUTPUT_FILE}")


def run_stress_detection():

    accel_df, audio_df = load_sensor_data()

    motion_events = detect_motion_events(accel_df)

    audio_events = detect_audio_events(audio_df)

    combined_events = combine_events(motion_events, audio_events)

    save_flagged_moments(combined_events)


if __name__ == "__main__":
    run_stress_detection()