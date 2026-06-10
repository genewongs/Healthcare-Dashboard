from datetime import date, datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, EmailStr, Field, field_validator


PatientStatus = Literal["active", "inactive", "pending", "discharged"]
BloodType = Literal["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]
PatientNoteCategory = Literal["general", "medication", "follow_up", "concern"]


class PatientBase(BaseModel):
    first_name: str = Field(min_length=1, max_length=100)
    last_name: str = Field(min_length=1, max_length=100)
    date_of_birth: date
    phone: str = Field(min_length=1, max_length=30)
    email: EmailStr | None = None
    address: str = Field(min_length=1)
    blood_type: BloodType
    allergies: list[str] = Field(min_length=1)
    conditions: str | None = None
    status: PatientStatus
    last_visit: date

    @field_validator("first_name", "last_name", "phone", "address")
    @classmethod
    def required_text_must_not_be_blank(cls, value: str) -> str:
        cleaned_value = value.strip()
        if not cleaned_value:
            raise ValueError("This field is required")
        return cleaned_value

    @field_validator("allergies")
    @classmethod
    def allergies_must_be_clean(cls, value: list[str]) -> list[str]:
        cleaned_allergies: list[str] = []
        seen_allergies: set[str] = set()
        for allergy in value:
            cleaned_allergy = allergy.strip()
            if not cleaned_allergy:
                continue
            if len(cleaned_allergy) > 100:
                raise ValueError("Allergy entries must be 100 characters or fewer")
            normalized_allergy = cleaned_allergy.lower()
            if normalized_allergy not in seen_allergies:
                cleaned_allergies.append(cleaned_allergy)
                seen_allergies.add(normalized_allergy)

        if not cleaned_allergies:
            raise ValueError("At least one allergy is required")

        return cleaned_allergies

    @field_validator("conditions")
    @classmethod
    def optional_text_must_be_clean(cls, value: str | None) -> str | None:
        if value is None:
            return None

        cleaned_value = value.strip()
        return cleaned_value or None


class PatientCreate(PatientBase):
    pass


class PatientUpdate(PatientBase):
    pass


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


class PatientStatsResponse(BaseModel):
    total: int
    active: int
    inactive: int
    pending: int
    discharged: int


class DashboardDistributionItem(BaseModel):
    label: str
    count: int


class DashboardStatsResponse(BaseModel):
    status_distribution: list[DashboardDistributionItem]
    age_demographics: list[DashboardDistributionItem]
    blood_type_distribution: list[DashboardDistributionItem]
    top_conditions: list[DashboardDistributionItem]


class PatientNoteCreate(BaseModel):
    timestamp: datetime | None = None
    content: str = Field(min_length=1, max_length=2000)
    category: PatientNoteCategory = "general"
    is_pinned: bool = False

    @field_validator("content")
    @classmethod
    def content_must_not_be_blank(cls, value: str) -> str:
        content = value.strip()
        if not content:
            raise ValueError("Note content cannot be empty")
        return content


class PatientNoteUpdate(BaseModel):
    is_pinned: bool | None = None


class PatientNoteResponse(BaseModel):
    id: int
    patient_id: int
    timestamp: datetime
    content: str
    category: PatientNoteCategory
    is_pinned: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class PatientSummaryResponse(BaseModel):
    patient_id: int
    summary: str
