import pandas as pd
import os
from fastapi import HTTPException

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FLAGGED_FILE = os.path.join(BASE_DIR, "generated_outputs", "flagged_moments.csv")


def load_flagged():
    if not os.path.exists(FLAGGED_FILE):
        raise HTTPException(
            status_code=404,
            detail="Flagged moments file not found. Run the pipeline first."
        )
    return pd.read_csv(FLAGGED_FILE)


def get_all_flags():
    df = load_flagged()
    return df.to_dict(orient="records")


def get_flags_by_driver(driver_id: str):
    df = load_flagged()
    filtered = df[df["driver_id"].astype(str) == str(driver_id)]

    if filtered.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No flags found for driver {driver_id}"
        )

    return filtered.to_dict(orient="records")


def get_flags_by_trip(trip_id: str):
    df = load_flagged()
    filtered = df[df["trip_id"] == trip_id]

    if filtered.empty:
        raise HTTPException(
            status_code=404,
            detail=f"No flags found for trip {trip_id}"
        )

    return filtered.to_dict(orient="records")


def get_flags_by_severity(severity: str):
    if severity not in ("low", "medium", "high"):
        raise HTTPException(
            status_code=400,
            detail="Severity must be 'low', 'medium', or 'high'"
        )

    df = load_flagged()
    filtered = df[df["severity"] == severity]

    return filtered.to_dict(orient="records")


def get_stress_summary():
    df = load_flagged()

    return {
        "total_flags": len(df),
        "by_severity": df["severity"].value_counts().to_dict(),
        "by_flag_type": df["flag_type"].value_counts().to_dict(),
        "by_driver": df.groupby("driver_id")["flag_id"].count().to_dict(),
    }


def run_pipeline():
    try:
        from stress_detection import run_stress_detection
        run_stress_detection()

        return {
            "status": "success",
            "message": "Stress detection pipeline completed."
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))