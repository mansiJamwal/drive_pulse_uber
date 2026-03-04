from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.velocity_routes import router as velocity_router
from routes.driver_routes import router as driver_router


app = FastAPI(title="Driver Velocity API")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(velocity_router)
app.include_router(driver_router)