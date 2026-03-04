from fastapi import APIRouter
import pandas as pd
import numpy as np

router = APIRouter()


@router.get("/velocity")
def get_all_velocity():

    df = pd.read_csv("generated_outputs/velocity_analysis.csv")

    df.replace([np.inf, -np.inf], np.nan, inplace=True)

    df = df.astype(object)
    df = df.where(pd.notnull(df), None)

    return df.to_dict(orient="records")