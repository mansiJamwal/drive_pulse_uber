from fastapi import APIRouter
from pydantic import BaseModel

from services.driver_service import (
    get_driver_dashboard_service,
    update_driver_goal_service,
    get_driver_trips_service,
    get_driver_progress_service
)

router = APIRouter()


class GoalUpdate(BaseModel):
    shift_start_time: str
    shift_end_time: str
    target_earnings: float
    target_hours: float


@router.get("/driver/{driver_id}")
def get_driver_dashboard(driver_id: str):
    return get_driver_dashboard_service(driver_id)


@router.post("/driver/{driver_id}/goal")
def update_driver_goal(driver_id: str, goal: GoalUpdate):
    return update_driver_goal_service(driver_id, goal)


@router.get("/driver/{driver_id}/trips")
def get_driver_trips(driver_id: str):
    return get_driver_trips_service(driver_id)


@router.get("/driver/{driver_id}/progress")
def get_driver_progress(driver_id: str):
    return get_driver_progress_service(driver_id)