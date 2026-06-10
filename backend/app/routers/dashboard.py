from fastapi import APIRouter, Depends
from sqlalchemy import case, func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Patient
from app.schemas import DashboardDistributionItem, DashboardStatsResponse


router = APIRouter(prefix="/dashboard", tags=["dashboard"])

AGE_BUCKETS = ["0-17", "18-34", "35-54", "55-64", "65+"]
BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
STATUSES = ["active", "inactive", "pending", "discharged"]


def build_ordered_distribution(
    rows: list[tuple[str, int]],
    labels: list[str],
) -> list[DashboardDistributionItem]:
    counts = {label: count for label, count in rows}
    return [DashboardDistributionItem(label=label, count=counts.get(label, 0)) for label in labels]


@router.get("/stats", response_model=DashboardStatsResponse)
def get_dashboard_stats(db: Session = Depends(get_db)) -> DashboardStatsResponse:
    status_rows = (
        db.query(Patient.status, func.count(Patient.id))
        .group_by(Patient.status)
        .all()
    )

    age_years = func.date_part("year", func.age(func.current_date(), Patient.date_of_birth))
    age_bucket = case(
        (age_years < 18, "0-17"),
        (age_years < 35, "18-34"),
        (age_years < 55, "35-54"),
        (age_years < 65, "55-64"),
        else_="65+",
    )
    age_rows = (
        db.query(age_bucket.label("age_bucket"), func.count(Patient.id))
        .group_by(age_bucket)
        .all()
    )

    blood_type_rows = (
        db.query(Patient.blood_type, func.count(Patient.id))
        .group_by(Patient.blood_type)
        .all()
    )

    condition_rows = (
        db.query(Patient.conditions, func.count(Patient.id))
        .filter(Patient.status == "active")
        .filter(Patient.conditions.isnot(None))
        .filter(func.btrim(Patient.conditions) != "")
        .group_by(Patient.conditions)
        .order_by(func.count(Patient.id).desc(), Patient.conditions.asc())
        .limit(5)
        .all()
    )

    return DashboardStatsResponse(
        status_distribution=build_ordered_distribution(status_rows, STATUSES),
        age_demographics=build_ordered_distribution(age_rows, AGE_BUCKETS),
        blood_type_distribution=build_ordered_distribution(blood_type_rows, BLOOD_TYPES),
        top_conditions=[
            DashboardDistributionItem(label=condition, count=count)
            for condition, count in condition_rows
        ],
    )
