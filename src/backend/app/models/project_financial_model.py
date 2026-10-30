import uuid
from datetime import datetime
from decimal import Decimal

from sqlalchemy import DateTime, ForeignKey, Numeric, UniqueConstraint, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ProjectFinancial(Base):
    """Perspektif Financial (1:1 dengan project). Revenue tidak disimpan: sama dengan value_before_tax.
    Net profit = revenue - cogs - operational_cost, dihitung saat dibaca."""

    __tablename__ = "project_financials"

    __table_args__ = (UniqueConstraint("project_id", name="uq_project_financials_project_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False
    )
    cogs: Mapped[Decimal] = mapped_column(
        Numeric(20, 2), nullable=False, default=Decimal("0"), server_default=text("0")
    )
    operational_cost: Mapped[Decimal] = mapped_column(
        Numeric(20, 2), nullable=False, default=Decimal("0"), server_default=text("0")
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

    project = relationship("Project", back_populates="financial", lazy="raise")
