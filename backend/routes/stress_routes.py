from fastapi import APIRouter
from services.stress_service import (
    get_all_flags,
    get_flags_by_driver,
    get_flags_by_trip,
    get_flags_by_severity,
    get_stress_summary,
    run_pipeline
)

router = APIRouter(prefix="/stress", tags=["Stress Detection"])


@router.get("/flags")
def flags():
    return get_all_flags()


@router.get("/flags/driver/{driver_id}")
def flags_by_driver(driver_id: str):
    return get_flags_by_driver(driver_id)


@router.get("/flags/trip/{trip_id}")
def flags_by_trip(trip_id: str):
    return get_flags_by_trip(trip_id)


@router.get("/flags/severity/{severity}")
def flags_by_severity(severity: str):
    return get_flags_by_severity(severity)


@router.get("/summary")
def stress_summary():
    return get_stress_summary()


@router.post("/run")
def run_stress_pipeline():
    return run_pipeline()