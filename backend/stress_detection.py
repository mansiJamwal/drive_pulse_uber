import pandas as pd
import os
from datetime import timedelta

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))


ACCEL_FILE = os.path.join(BASE_DIR, "data", "sensor_data", "accelerometer_data.csv")
AUDIO_FILE = os.path.join(BASE_DIR, "data", "sensor_data", "audio_intensity_data.csv")

OUTPUT_FILE = os.path.join(BASE_DIR, "backend", "generated_outputs", "flagged_moments.csv")




def load_sensor_data():
    accel = pd.read_csv(ACCEL_FILE)
    audio = pd.read_csv(AUDIO_FILE)

    accel["timestamp"] = pd.to_datetime(accel["timestamp"])
    audio["timestamp"] = pd.to_datetime(audio["timestamp"])

    return accel, audio



def detect_motion_events(accel_df):

    motion_events = []

    for _, row in accel_df.iterrows():

        flag_type = None
        motion_score = 0

        if row["accel_x"] < -3:
            flag_type = "harsh_braking"
            motion_score = 0.8

        elif row["accel_x"] > 3:
            flag_type = "rapid_acceleration"
            motion_score = 0.7

        elif abs(row["accel_y"]) > 3:
            flag_type = "sharp_turn"
            motion_score = 0.6

        if flag_type:

            motion_events.append({
                "trip_id": row["trip_id"],
                "timestamp": row["timestamp"],
                "elapsed_seconds": row["elapsed_seconds"],
                "flag_type": flag_type,
                "motion_score": motion_score,
                "audio_score": 0
            })

    return motion_events



def detect_audio_events(audio_df):

    audio_events = []

    for _, row in audio_df.iterrows():

        flag_type = None
        audio_score = 0

        if row["audio_classification"] == "argument":
            flag_type = "conflict_moment"
            audio_score = 0.9

        elif row["audio_level_db"] > 90:
            flag_type = "audio_spike"
            audio_score = 0.8

        elif row["sustained_duration_sec"] > 60:
            flag_type = "sustained_stress"
            audio_score = 0.7

        if flag_type:

            audio_events.append({
                "trip_id": row["trip_id"],
                "timestamp": row["timestamp"],
                "elapsed_seconds": row["elapsed_seconds"],
                "flag_type": flag_type,
                "motion_score": 0,
                "audio_score": audio_score
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

    for event in motion_events + audio_events:

        combined_score = (event["motion_score"] + event["audio_score"]) / 2
        severity = get_severity(combined_score)

        explanation = ""

        if event["flag_type"] == "harsh_braking":
            explanation = "Sudden deceleration detected."

        elif event["flag_type"] == "rapid_acceleration":
            explanation = "Rapid acceleration detected."

        elif event["flag_type"] == "sharp_turn":
            explanation = "Sharp lateral movement detected."

        elif event["flag_type"] == "conflict_moment":
            explanation = "Passenger argument detected."

        elif event["flag_type"] == "audio_spike":
            explanation = "High cabin noise detected."

        elif event["flag_type"] == "sustained_stress":
            explanation = "Sustained elevated cabin noise."

        combined.append({
            "flag_id": f"FLAG{flag_counter:03}",
            "trip_id": event["trip_id"],
            "timestamp": event["timestamp"],
            "elapsed_seconds": event["elapsed_seconds"],
            "flag_type": event["flag_type"],
            "severity": severity,
            "motion_score": event["motion_score"],
            "audio_score": event["audio_score"],
            "combined_score": combined_score,
            "explanation": explanation
        })

        flag_counter += 1

    return combined


def save_flagged_moments(events):

    df = pd.DataFrame(events)

    os.makedirs("backend/generated_outputs", exist_ok=True)

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