import pandas as pd
import os

# -----------------------------
# Base Paths
# -----------------------------
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ACCEL_FILE = os.path.join(BASE_DIR, "data", "sensor_data", "accelerometer_data.csv")
AUDIO_FILE = os.path.join(BASE_DIR, "data", "sensor_data", "audio_intensity_data.csv")
TRIPS_FILE = os.path.join(BASE_DIR, "data", "trips", "trips.csv")

OUTPUT_FILE = os.path.join(BASE_DIR, "backend", "generated_outputs", "flagged_moments.csv")


# -----------------------------
# Load Sensor + Trip Data
# -----------------------------
def load_sensor_data():

    accel = pd.read_csv(ACCEL_FILE)
    audio = pd.read_csv(AUDIO_FILE)
    trips = pd.read_csv(TRIPS_FILE)

    accel["timestamp"] = pd.to_datetime(accel["timestamp"])
    audio["timestamp"] = pd.to_datetime(audio["timestamp"])

    # FIX: ensure numeric types
    audio["audio_level_db"] = pd.to_numeric(audio["audio_level_db"], errors="coerce")
    audio["sustained_duration_sec"] = pd.to_numeric(audio["sustained_duration_sec"], errors="coerce")

    # attach driver_id
    accel = accel.merge(trips[["trip_id", "driver_id"]], on="trip_id", how="left")
    audio = audio.merge(trips[["trip_id", "driver_id"]], on="trip_id", how="left")

    return accel, audio

def calculate_motion_score(accel_x, accel_y):

    longitudinal = min(abs(accel_x) / 4, 1)

    lateral = min(abs(accel_y) / 4, 1)

    motion_score = 0.6 * longitudinal + 0.4 * lateral

    return round(motion_score, 2)
# -----------------------------
# Detect Motion Events
# -----------------------------
def detect_motion_events(accel_df):

    motion_events = []

    for _, row in accel_df.iterrows():

        motion_score = calculate_motion_score(
            row["accel_x"],
            row["accel_y"]
        )

        flag_type = None
        motion_context = "normal driving"

        # Detect events based on score
        if motion_score > 0.35:

            if row["accel_x"] < -2.5:
                flag_type = "harsh_braking"
                motion_context = "harsh brake"

            elif row["accel_x"] < -1.5:
                flag_type = "moderate_brake"
                motion_context = "moderate brake"

            elif abs(row["accel_y"]) > 2:
                flag_type = "sharp_turn"
                motion_context = "sharp turn"

            else:
                flag_type = "aggressive_motion"
                motion_context = "unstable driving motion"

        if flag_type:

            motion_events.append({
                "trip_id": row["trip_id"],
                "driver_id": row["driver_id"],
                "timestamp": row["timestamp"],
                "elapsed_seconds": row["elapsed_seconds"],
                "flag_type": flag_type,
                "motion_score": motion_score,
                "audio_score": 0,
                "motion_context": motion_context,
                "audio_context": "normal"
            })

    return motion_events

# -----------------------------
# Calculate Audio Score
# -----------------------------
def calculate_audio_score(audio_level_db, audio_classification, duration):

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


# -----------------------------
# Detect Audio Events
# -----------------------------
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

        # MAIN detection using score
        if audio_score > 0.35:

            if classification == "argument":
                flag_type = "conflict_moment"
                audio_context = "argument detected"

            elif row["audio_level_db"] > 85:
                flag_type = "audio_spike"
                audio_context = "very loud cabin noise"

            elif row["sustained_duration_sec"] > 40:
                flag_type = "sustained_stress"
                audio_context = "sustained elevated audio"

            else:
                flag_type = "elevated_audio"
                audio_context = "elevated cabin noise"

        if flag_type:

            audio_events.append({
                "trip_id": row["trip_id"],
                "driver_id": row["driver_id"],
                "timestamp": row["timestamp"],
                "elapsed_seconds": row["elapsed_seconds"],
                "flag_type": flag_type,
                "motion_score": 0,
                "audio_score": audio_score,
                "motion_context": "normal",
                "audio_context": audio_context
            })

            print(
    row["audio_level_db"],
    row["audio_classification"],
    row["sustained_duration_sec"],
    audio_score
)

    return audio_events

# -----------------------------
# Severity Classification
# -----------------------------
def get_severity(score):

    if score >= 0.8:
        return "high"
    elif score >= 0.55:
        return "medium"
    else:
        return "low"


# -----------------------------
# Combine Events
# -----------------------------
def combine_events(motion_events, audio_events):

    combined = []
    flag_counter = 1

    for event in motion_events + audio_events:

        combined_score = round((event["motion_score"] + event["audio_score"]) / 2, 2)

        severity = get_severity(combined_score)

        explanation = ""

        if event["flag_type"] == "harsh_braking":
            explanation = "Sudden deceleration detected indicating aggressive braking."

        elif event["flag_type"] == "moderate_brake":
            explanation = "Moderate braking detected during driving."

        elif event["flag_type"] == "sharp_turn":
            explanation = "Sharp steering movement detected suggesting abrupt maneuver."

        elif event["flag_type"] == "conflict_moment":
            explanation = "Passenger argument or conflict detected from cabin audio."

        elif event["flag_type"] == "audio_spike":
            explanation = "Short burst of loud cabin noise detected."

        elif event["flag_type"] == "sustained_stress":
            explanation = "Cabin noise remained elevated for a sustained duration."

        context = f"Motion context: {event['motion_context']} | Audio context: {event['audio_context']}"

        combined.append({
            "flag_id": f"FLAG{flag_counter:03}",
            "trip_id": event["trip_id"],
            "driver_id": event["driver_id"],
            "timestamp": event["timestamp"],
            "elapsed_seconds": event["elapsed_seconds"],
            "flag_type": event["flag_type"],
            "severity": severity,
            "motion_score": event["motion_score"],
            "audio_score": event["audio_score"],
            "combined_score": combined_score,
            "explanation": explanation,
            "context": context
        })

        flag_counter += 1

    return combined


# -----------------------------
# Save Output
# -----------------------------
def save_flagged_moments(events):

    df = pd.DataFrame(events)

    df = df.sort_values("timestamp")

    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)

    df.to_csv(OUTPUT_FILE, index=False)

    print(f"Saved {len(df)} flagged events → {OUTPUT_FILE}")


# -----------------------------
# Main Pipeline
# -----------------------------
def run_stress_detection():

    accel_df, audio_df = load_sensor_data()

    motion_events = detect_motion_events(accel_df)

    audio_events = detect_audio_events(audio_df)

    combined_events = combine_events(motion_events, audio_events)

    save_flagged_moments(combined_events)


if __name__ == "__main__":
    run_stress_detection()