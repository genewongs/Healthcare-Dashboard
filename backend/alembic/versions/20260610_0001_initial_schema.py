"""create patient schema

Revision ID: 20260610_0001
Revises:
Create Date: 2026-06-10
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "20260610_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")

    op.create_table(
        "patients",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("first_name", sa.String(length=100), nullable=False),
        sa.Column("last_name", sa.String(length=100), nullable=False),
        sa.Column("date_of_birth", sa.Date(), nullable=False),
        sa.Column("phone", sa.String(length=30), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("address", sa.Text(), nullable=False),
        sa.Column("blood_type", sa.String(length=10), nullable=False),
        sa.Column(
            "allergies",
            postgresql.ARRAY(sa.String()),
            server_default="{}",
            nullable=False,
        ),
        sa.Column("conditions", sa.Text(), nullable=True),
        sa.Column("status", sa.String(length=20), nullable=False),
        sa.Column("last_visit", sa.Date(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.CheckConstraint(
            "status IN ('active', 'inactive', 'pending', 'discharged')",
            name="ck_patients_status",
        ),
        sa.CheckConstraint(
            "blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')",
            name="ck_patients_blood_type",
        ),
        sa.CheckConstraint("cardinality(allergies) > 0", name="ck_patients_allergies_not_empty"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_patients_id", "patients", ["id"])
    op.create_index("ix_patients_status", "patients", ["status"])
    op.create_index("ix_patients_date_of_birth", "patients", ["date_of_birth"])
    op.create_index("ix_patients_last_visit", "patients", ["last_visit"])
    op.create_index("ix_patients_last_name", "patients", ["last_name"])
    op.create_index("ix_patients_last_name_id", "patients", ["last_name", "id"])
    op.create_index("ix_patients_last_visit_id", "patients", ["last_visit", "id"])
    op.create_index("ix_patients_status_last_visit_id", "patients", ["status", "last_visit", "id"])
    op.execute("CREATE INDEX ix_patients_first_name_trgm ON patients USING gin (first_name gin_trgm_ops)")
    op.execute("CREATE INDEX ix_patients_last_name_trgm ON patients USING gin (last_name gin_trgm_ops)")
    op.execute("CREATE INDEX ix_patients_email_trgm ON patients USING gin (email gin_trgm_ops)")
    op.execute("CREATE INDEX ix_patients_phone_trgm ON patients USING gin (phone gin_trgm_ops)")

    op.create_table(
        "patient_notes",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=30), nullable=False),
        sa.Column("is_pinned", sa.Boolean(), server_default="false", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.ForeignKeyConstraint(["patient_id"], ["patients.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index("ix_patient_notes_id", "patient_notes", ["id"])
    op.create_index("ix_patient_notes_patient_id", "patient_notes", ["patient_id"])
    op.create_index(
        "ix_patient_notes_patient_sort",
        "patient_notes",
        ["patient_id", "is_pinned", "timestamp", "id"],
    )


def downgrade() -> None:
    op.drop_index("ix_patient_notes_patient_sort", table_name="patient_notes")
    op.drop_index("ix_patient_notes_patient_id", table_name="patient_notes")
    op.drop_index("ix_patient_notes_id", table_name="patient_notes")
    op.drop_table("patient_notes")

    op.drop_index("ix_patients_phone_trgm", table_name="patients")
    op.drop_index("ix_patients_email_trgm", table_name="patients")
    op.drop_index("ix_patients_last_name_trgm", table_name="patients")
    op.drop_index("ix_patients_first_name_trgm", table_name="patients")
    op.drop_index("ix_patients_status_last_visit_id", table_name="patients")
    op.drop_index("ix_patients_last_visit_id", table_name="patients")
    op.drop_index("ix_patients_last_name_id", table_name="patients")
    op.drop_index("ix_patients_last_name", table_name="patients")
    op.drop_index("ix_patients_last_visit", table_name="patients")
    op.drop_index("ix_patients_date_of_birth", table_name="patients")
    op.drop_index("ix_patients_status", table_name="patients")
    op.drop_index("ix_patients_id", table_name="patients")
    op.drop_table("patients")
