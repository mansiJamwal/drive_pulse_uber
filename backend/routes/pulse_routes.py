from fastapi import APIRouter
from services.pulse_service import get_driver_pulse

router = APIRouter()

@router.get("/pulse/{driver_id}")
def get_pulse(driver_id: str):
    return get_driver_pulse(driver_id)