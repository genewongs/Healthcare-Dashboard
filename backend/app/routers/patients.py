from datetime import date
from math import ceil
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Patient, PatientNote
from app.schemas import (
    PatientCreate,
    PatientListResponse,
    PatientNoteCreate,
    PatientNoteResponse,
    PatientResponse,
    PatientStatus,
    PatientSummaryResponse,
    PatientUpdate,
)

router = APIRouter(prefix="/patients", tags=["patients"])

PatientSortField = Literal[
    "id",
    "first_name",
    "last_name",
    "date_of_birth",
    "status",
    "last_visit",
    "created_at",
    "updated_at",
]
SortOrder = Literal["asc", "desc"]


def calculate_age(date_of_birth: date | None) -> int | None:
    if date_of_birth is None:
        return None

    today = date.today()
    age = today.year - date_of_birth.year
    if (today.month, today.day) < (date_of_birth.month, date_of_birth.day):
        age -= 1
    return age


def build_notes_narrative(notes: list[PatientNote]) -> str:
    if not notes:
        return "No clinical notes have been recorded for this patient yet."

    note_summaries = [
        f"On {note.timestamp.date().isoformat()}, the care team noted: {note.content}"
        for note in notes
    ]
    return " ".join(note_summaries)


@router.get("", response_model=PatientListResponse)
def list_patients(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    search: str | None = Query(None),
    status: PatientStatus | None = Query(None),
    sort_by: PatientSortField = Query("last_name"),
    sort_order: SortOrder = Query("asc"),
    db: Session = Depends(get_db),
) -> PatientListResponse:
    query = db.query(Patient)

    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                Patient.first_name.ilike(search_term),
                Patient.last_name.ilike(search_term),
                Patient.email.ilike(search_term),
                Patient.phone.ilike(search_term),
            )
        )

    if status:
        query = query.filter(Patient.status == status)

    total = query.count()
    sort_column = getattr(Patient, sort_by)
    if sort_order == "desc":
        sort_column = sort_column.desc()

    patients = (
        query.order_by(sort_column)
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return PatientListResponse(
        items=patients,
        total=total,
        page=page,
        page_size=page_size,
        total_pages=ceil(total / page_size) if total else 0,
    )


@router.get("/{id}", response_model=PatientResponse)
def get_patient(id: int, db: Session = Depends(get_db)) -> Patient:
    patient = db.get(Patient, id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return patient


@router.get("/{id}/summary", response_model=PatientSummaryResponse)
def get_patient_summary(id: int, db: Session = Depends(get_db)) -> PatientSummaryResponse:
    patient = db.get(Patient, id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    notes = (
        db.query(PatientNote)
        .filter(PatientNote.patient_id == id)
        .order_by(PatientNote.timestamp.asc(), PatientNote.id.asc())
        .all()
    )
    age = calculate_age(patient.date_of_birth)
    age_text = f"{age} years old" if age is not None else "age not recorded"
    blood_type = patient.blood_type or "not recorded"
    conditions = patient.conditions or "none documented"
    allergies = patient.allergies or "none documented"
    notes_narrative = build_notes_narrative(notes)

    # gwong: todo - we could utilize an LLM here to make the natural language better. 
    summary = (
        f"{patient.first_name} {patient.last_name} is {age_text}. "
        f"Blood type is {blood_type}. "
        f"Documented conditions include {conditions}. "
        f"Documented allergies include {allergies}. "
        f"{notes_narrative}"
    )

    return PatientSummaryResponse(patient_id=patient.id, summary=summary)


@router.post(
    "/{id}/notes",
    response_model=PatientNoteResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_patient_note(
    id: int,
    note_data: PatientNoteCreate,
    db: Session = Depends(get_db),
) -> PatientNote:
    patient = db.get(Patient, id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    note = PatientNote(
        patient_id=id,
        **note_data.model_dump(exclude_none=True),
    )
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{id}/notes", response_model=list[PatientNoteResponse])
def list_patient_notes(id: int, db: Session = Depends(get_db)) -> list[PatientNote]:
    patient = db.get(Patient, id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    return (
        db.query(PatientNote)
        .filter(PatientNote.patient_id == id)
        .order_by(PatientNote.timestamp.desc(), PatientNote.id.desc())
        .all()
    )


@router.delete("/{id}/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient_note(
    id: int,
    note_id: int,
    db: Session = Depends(get_db),
) -> None:
    patient = db.get(Patient, id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    note = (
        db.query(PatientNote)
        .filter(PatientNote.id == note_id, PatientNote.patient_id == id)
        .first()
    )
    if note is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found",
        )

    db.delete(note)
    db.commit()
    return None


@router.post("", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
) -> Patient:
    patient = Patient(**patient_data.model_dump())
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return patient


@router.put("/{id}", response_model=PatientResponse)
def update_patient(
    id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
) -> Patient:
    patient = db.get(Patient, id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    update_data = patient_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(patient, field, value)

    db.commit()
    db.refresh(patient)
    return patient


@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_patient(id: int, db: Session = Depends(get_db)) -> None:
    patient = db.get(Patient, id)
    if patient is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found",
        )

    db.delete(patient)
    db.commit()
    return None
