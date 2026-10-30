import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Customer(Base):
    """Perspektif Customer: satu baris customer per project (1:1 lewat project_id)."""

    __tablename__ = "customers"

    __table_args__ = (UniqueConstraint("project_id", name="uq_customers_project_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False)
    customer_location: Mapped[str | None] = mapped_column(String(255))
    # "Revenue/Annual Sales/Annual Budget" di Excel berupa teks bebas, mis. "115T (FY 2025)".
    annual_revenue: Mapped[str | None] = mapped_column(String(100))
    company_size_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("company_sizes.id", ondelete="RESTRICT")
    )
    customer_type_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("customer_types.id", ondelete="RESTRICT")
    )
    industry_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("industries.id", ondelete="RESTRICT")
    )
    legal_structure_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("legal_structures.id", ondelete="RESTRICT")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT")
    )

    project = relationship("Project", back_populates="customer", lazy="raise")
    company_size = relationship("CompanySize", lazy="raise")
    customer_type = relationship("CustomerType", lazy="raise")
    industry = relationship("Industry", lazy="raise")
    legal_structure = relationship("LegalStructure", lazy="raise")
