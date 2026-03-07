import pandas as pd
import os
import math


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
    print("ACCEL columns:", accel.columns)
    print("AUDIO columns:", audio.columns)

    accel["timestamp"] = pd.to_datetime(accel["timestamp"])
    audio["timestamp"] = pd.to_datetime(audio["timestamp"])

    # FIX: ensure numeric types
    audio["audio_level_db"] = pd.to_numeric(audio["audio_level_db"], errors="coerce")
    audio["sustained_duration_sec"] = pd.to_numeric(audio["sustained_duration_sec"], errors="coerce")

    # attach driver_id
    accel = accel.merge(trips[["trip_id", "driver_id"]], on="trip_id", how="left")
    audio = audio.merge(trips[["trip_id", "driver_id"]], on="trip_id", how="left")

    return accel, audio

def calculate_motion_score(ax, ay):

    if pd.isna(ax) or pd.isna(ay):
        return 0

    magnitude = math.sqrt(ax**2 + ay**2)

    # harsh driving usually around 6–8 m/s²
    score = min(magnitude / 7, 1)

    return round(score, 2)
# -----------------------------
# Detect Motion Events
# -----------------------------
def detect_motion_events(accel_df):

    motion_events = []

    for _, row in accel_df.iterrows():

        ax = row["accel_x"]
        ay = row["accel_y"]

        motion_score = calculate_motion_score(ax, ay)

        flag_type = None
        motion_context = "normal driving"

        if motion_score > 0.35:

            if abs(ax) > 3:
                flag_type = "harsh_braking"
                motion_context = "harsh braking detected"

            elif abs(ax) > 2:
                flag_type = "moderate_brake"
                motion_context = "moderate braking"

            elif abs(ay) > 3:
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

    if pd.isna(audio_level_db):
        return 0

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

    all_events = motion_events + audio_events
    df = pd.DataFrame(all_events)

    if df.empty:
        return []

    df = df.sort_values(["trip_id", "timestamp", "elapsed_seconds"])

    grouped = df.groupby(["trip_id", "timestamp", "elapsed_seconds"])

    for _, group in grouped:

        motion_score = group["motion_score"].max()
        audio_score = group["audio_score"].max()

        flag_type = ", ".join(group["flag_type"].unique())

        combined_score = round((motion_score + audio_score) / 2, 2)
        severity = get_severity(combined_score)

        # Context generation
        motion_ctx = "normal"
        audio_ctx = "normal"

        # if motion_score > 0.75:
        #     motion_ctx = "harsh brake"
        # elif motion_score > 0.5:
        #     motion_ctx = "moderate brake"
        # elif motion_score > 0.35:
        #     motion_ctx = "aggressive motion"

        # if audio_score > 0.85:
        #     audio_ctx = "argument"
        # elif audio_score > 0.6:
        #     audio_ctx = "very loud"
        # elif audio_score > 0.35:
        #     audio_ctx = "elevated"

        # motion context based on flag_type
        if "harsh_braking" in flag_type:
            motion_ctx = "harsh brake"
        elif "moderate_brake" in flag_type:
            motion_ctx = "moderate brake"
        elif "sharp_turn" in flag_type:
            motion_ctx = "sharp turn"
        elif "aggressive_motion" in flag_type:
            motion_ctx = "aggressive motion"

# audio context based on flag_type
        if "conflict_moment" in flag_type:
            audio_ctx = "argument detected"
        elif "audio_spike" in flag_type:
            audio_ctx = "very loud cabin noise"
        elif "sustained_stress" in flag_type:
            audio_ctx = "sustained elevated audio"
        elif "elevated_audio" in flag_type:
            audio_ctx = "elevated cabin noise"

        # Explanation
        if motion_score > 0 and audio_score > 0:
            explanation = (
                f"Combined signal: aggressive motion (score={motion_score}) "
                f"+ elevated cabin audio (score={audio_score})."
            )
        elif motion_score > 0:
            explanation = f"Driving maneuver detected (motion score={motion_score})."
        else:
            explanation = f"Elevated cabin audio detected (audio score={audio_score})."

        context = f"Motion: {motion_ctx} | Audio: {audio_ctx}"

        # APPEND INSIDE LOOP
        combined.append({
            "flag_id": f"FLAG{flag_counter:03}",
            "trip_id": group["trip_id"].iloc[0],
            "driver_id": group["driver_id"].iloc[0],
            "timestamp": group["timestamp"].iloc[0],
            "elapsed_seconds": group["elapsed_seconds"].iloc[0],
            "flag_type": flag_type,
            "severity": severity,
            "motion_score": motion_score,
            "audio_score": audio_score,
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

    df = df.replace([float("inf"), float("-inf")], None)
    df = df.where(pd.notnull(df), None)

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

