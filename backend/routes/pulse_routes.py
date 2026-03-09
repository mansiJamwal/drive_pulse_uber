import pandas as pd
import os
from fastapi import APIRouter

router = APIRouter()

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PULSE_FILE = os.path.join(BASE_DIR, "generated_outputs", "pulse_scores.csv")


@router.get("/pulse/{driver_id}")
def get_driver_pulse(driver_id: str):

    if not os.path.exists(PULSE_FILE):
        return []

    df = pd.read_csv(PULSE_FILE)

    df["driver_id"] = df["driver_id"].astype(str)

    df = df[df["driver_id"] == driver_id]

    return df.to_dict(orient="records")