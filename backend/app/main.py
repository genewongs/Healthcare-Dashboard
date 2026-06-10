from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import SessionLocal
from app.routers.dashboard import router as dashboard_router
from app.routers.health import router as health_router
from app.routers.patients import router as patients_router
from app.seed import seed_patients


app = FastAPI(title="Healthcare Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://0.0.0.0:5173",
    ],
    allow_origin_regex=r"http://172\.\d+\.\d+\.\d+:5173",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def seed_database() -> None:
    db = SessionLocal()
    try:
        seed_patients(db)
    finally:
        db.close()


app.include_router(health_router)
app.include_router(patients_router)
app.include_router(dashboard_router)
