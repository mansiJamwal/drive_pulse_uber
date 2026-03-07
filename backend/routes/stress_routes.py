from fastapi import APIRouter, HTTPException
import pandas as pd
import os

router = APIRouter(prefix="/stress", tags=["Stress Detection"])

FLAGGED_FILE = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "generated_outputs", "flagged_moments.csv"
)


def load_flagged():
    if not os.path.exists(FLAGGED_FILE):
        raise HTTPException(
            status_code=404,
            detail="Flagged moments file not found. Run the pipeline first."
        )
    return pd.read_csv(FLAGGED_FILE)


@router.get("/flags")
def get_all_flags():
    """Return all flagged moments."""
    df = load_flagged()
    return df.to_dict(orient="records")


@router.get("/flags/driver/{driver_id}")
def get_flags_by_driver(driver_id: str):
    """Return flagged moments for a specific driver."""
    df = load_flagged()
    filtered = df[df["driver_id"].astype(str) == str(driver_id)]
    if filtered.empty:
        raise HTTPException(status_code=404, detail=f"No flags found for driver {driver_id}")
    return filtered.to_dict(orient="records")


@router.get("/flags/trip/{trip_id}")
def get_flags_by_trip(trip_id: str):
    """Return flagged moments for a specific trip."""
    df = load_flagged()
    filtered = df[df["trip_id"] == trip_id]
    if filtered.empty:
        raise HTTPException(status_code=404, detail=f"No flags found for trip {trip_id}")
    return filtered.to_dict(orient="records")


@router.get("/flags/severity/{severity}")
def get_flags_by_severity(severity: str):
    """Return flags filtered by severity: low, medium, high."""
    if severity not in ("low", "medium", "high"):
        raise HTTPException(status_code=400, detail="Severity must be 'low', 'medium', or 'high'")
    df = load_flagged()
    filtered = df[df["severity"] == severity]
    return filtered.to_dict(orient="records")


@router.get("/summary")
def get_stress_summary():
    """Aggregate summary: flag counts by driver, type, and severity."""
    df = load_flagged()
    summary = {
        "total_flags": len(df),
        "by_severity": df["severity"].value_counts().to_dict(),
        "by_flag_type": df["flag_type"].value_counts().to_dict(),
        "by_driver": df.groupby("driver_id")["flag_id"].count().to_dict(),
    }
    return summary


@router.post("/run")
def run_pipeline():
    """Trigger the stress detection pipeline to regenerate flagged_moments.csv."""
    try:
        from stress_detection import run_stress_detection
        run_stress_detection()
        return {"status": "success", "message": "Stress detection pipeline completed."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))