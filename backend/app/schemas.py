from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


PatientStatus = Literal["active", "inactive", "pending", "discharged"]


class PatientBase(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    date_of_birth: date | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    blood_type: str | None = None
    allergies: str | None = None
    conditions: str | None = None
    status: PatientStatus = "active"
    last_visit: date | None = None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(BaseModel):
    first_name: str | None = Field(default=None, min_length=1)
    last_name: str | None = Field(default=None, min_length=1)
    date_of_birth: date | None = None
    phone: str | None = None
    email: EmailStr | None = None
    address: str | None = None
    blood_type: str | None = None
    allergies: str | None = None
    conditions: str | None = None
    status: PatientStatus | None = None
    last_visit: date | None = None


class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientListResponse(BaseModel):
    items: list[PatientResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class PatientNoteCreate(BaseModel):
    timestamp: datetime | None = None
    content: str = Field(min_length=1)

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        content = value.strip()
        if not content:
            raise ValueError("Note content cannot be empty")
        return content


class PatientNoteResponse(BaseModel):
    id: int
    patient_id: int
    timestamp: datetime
    content: str
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientSummaryResponse(BaseModel):
    patient_id: int
    summary: str
