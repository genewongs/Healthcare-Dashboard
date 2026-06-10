from datetime import date, datetime

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Integer,
    String,
    Text,
    func,
)
from sqlalchemy.dialects.postgresql import ARRAY
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Patient(Base):
    __tablename__ = "patients"
    __table_args__ = (
        CheckConstraint(
            "status IN ('active', 'inactive', 'pending', 'discharged')",
            name="ck_patients_status",
        ),
        CheckConstraint(
            "blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')",
            name="ck_patients_blood_type",
        ),
        CheckConstraint("cardinality(allergies) > 0", name="ck_patients_allergies_not_empty"),
        Index("ix_patients_last_name_id", "last_name", "id"),
        Index("ix_patients_last_visit_id", "last_visit", "id"),
        Index("ix_patients_status_last_visit_id", "status", "last_visit", "id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    phone: Mapped[str] = mapped_column(String(30), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str] = mapped_column(Text, nullable=False)
    blood_type: Mapped[str] = mapped_column(String(10), nullable=False)
    allergies: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        nullable=False,
        default=list,
        server_default="{}",
    )
    conditions: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="active", index=True)
    last_visit: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=func.now(),
    )
    notes: Mapped[list["PatientNote"]] = relationship(
        back_populates="patient",
        cascade="all, delete-orphan",
    )


class PatientNote(Base):
    __tablename__ = "patient_notes"
    __table_args__ = (
        Index("ix_patient_notes_patient_sort", "patient_id", "is_pinned", "timestamp", "id"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    patient_id: Mapped[int] = mapped_column(
        ForeignKey("patients.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )
    content: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(30), nullable=False, default="general")
    is_pinned: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False,
        default=False,
        server_default="false",
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    patient: Mapped[Patient] = relationship(back_populates="notes")
