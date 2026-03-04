import numpy as np
from main import run_velocity_pipeline


df = run_velocity_pipeline()

print(
    df[
        [
            "driver_id",
            "cumulative_earnings",
            "elapsed_hours",
            "computed_velocity",
            "remaining_hours",
            "predicted_final",
            "forecast"
        ]
    ].head()
)

velocity_check = np.isclose(
    df["computed_velocity"],
    df["cumulative_earnings"] /
    df["elapsed_hours"].replace(0, 1e-6)
)

print("Velocity calculation correct:", velocity_check.all())