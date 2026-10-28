import uuid
from datetime import date, datetime
from decimal import Decimal

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Date,
    DateTime,
    ForeignKey,
    Index,
    Numeric,
    SmallInteger,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Project(Base):
    """Perspektif Project. Satu baris = satu portofolio; perspektif lain menempel lewat project_id.
    Dihapus secara soft delete (deleted_at), jadi semua FK anak memakai RESTRICT."""

    __tablename__ = "projects"

    __table_args__ = (
        CheckConstraint("value_before_tax >= 0", name="ck_projects_value_before_tax_nonnegative"),
        CheckConstraint("end_date > start_date", name="ck_projects_end_after_start"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_code: Mapped[str] = mapped_column(String(100), nullable=False)
    opportunity: Mapped[str | None] = mapped_column(String(255))
    project_name: Mapped[str] = mapped_column(String(255), nullable=False)
    year: Mapped[int] = mapped_column(SmallInteger, nullable=False)
    contract_name: Mapped[str | None] = mapped_column(String(255))
    contract_number: Mapped[str | None] = mapped_column(String(150))
    business_unit_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("business_units.id", ondelete="RESTRICT"), nullable=False
    )
    project_status_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("project_statuses.id", ondelete="RESTRICT"), nullable=False
    )
    value_before_tax: Mapped[Decimal] = mapped_column(Numeric(20, 2), nullable=False)
    carry_over_value: Mapped[Decimal | None] = mapped_column(Numeric(20, 2))
    project_manager: Mapped[str | None] = mapped_column(String(150))
    account_manager: Mapped[str | None] = mapped_column(String(150))
    start_date: Mapped[date] = mapped_column(Date, nullable=False)
    end_date: Mapped[date] = mapped_column(Date, nullable=False)
    project_objective: Mapped[str | None] = mapped_column(Text)
    project_description: Mapped[str | None] = mapped_column(Text)
    project_background: Mapped[str | None] = mapped_column(Text)
    project_challenges: Mapped[str | None] = mapped_column(Text)
    project_solution: Mapped[str | None] = mapped_column(Text)
    is_featured: Mapped[bool] = mapped_column(
        Boolean, nullable=False, default=False, server_default=text("false")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT")
    )
    updated_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT")
    )
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    business_unit = relationship("BusinessUnit", lazy="raise")
    project_status = relationship("ProjectStatus", lazy="raise")
    customer = relationship(
        "Customer", back_populates="project", uselist=False, cascade="all, delete-orphan", lazy="raise"
    )
    financial = relationship(
        "ProjectFinancial", back_populates="project", uselist=False, cascade="all, delete-orphan", lazy="raise"
    )
    products = relationship(
        "ProjectProduct", back_populates="project", cascade="all, delete-orphan", lazy="raise"
    )
    tech_stacks = relationship(
        "ProjectTechStack", back_populates="project", cascade="all, delete-orphan", lazy="raise"
    )
    partners = relationship(
        "ProjectPartner", back_populates="project", cascade="all, delete-orphan", lazy="raise"
    )
    success_metrics = relationship(
        "ProjectSuccessMetric",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectSuccessMetric.sort_order",
        lazy="raise",
    )
    files = relationship(
        "ProjectFile",
        back_populates="project",
        cascade="all, delete-orphan",
        order_by="ProjectFile.sort_order",
        lazy="raise",
    )


# project_code unik (tanpa beda huruf) hanya untuk project yang belum dihapus,
# jadi kode project yang sudah di-soft-delete boleh dipakai lagi.
Index(
    "uq_projects_project_code_live_lower",
    func.lower(Project.project_code),
    unique=True,
    postgresql_where=Project.deleted_at.is_(None),
)
