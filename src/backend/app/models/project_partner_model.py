import uuid

from sqlalchemy import CheckConstraint, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

PARTNER_ROLES = ("principal", "vendor")


class ProjectPartner(Base):
    """Perspektif Partner: partner yang terlibat beserta perannya (principal atau vendor)."""

    __tablename__ = "project_partners"

    __table_args__ = (
        CheckConstraint("partner_role IN ('principal', 'vendor')", name="ck_project_partners_role"),
    )

    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), primary_key=True
    )
    partner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("partners.id", ondelete="RESTRICT"), primary_key=True
    )
    partner_role: Mapped[str] = mapped_column(String(20), primary_key=True)
    partner_contribution: Mapped[str | None] = mapped_column(String(150))

    project = relationship("Project", back_populates="partners", lazy="raise")
    partner = relationship("Partner", lazy="raise")
