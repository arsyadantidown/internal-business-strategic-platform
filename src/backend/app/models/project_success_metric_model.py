import uuid

from sqlalchemy import ForeignKey, Index, SmallInteger, String, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ProjectSuccessMetric(Base):
    """Angka keberhasilan project, mis. value "+60%" dengan label "Increase in Digital Users"."""

    __tablename__ = "project_success_metrics"

    __table_args__ = (Index("ix_project_success_metrics_project_id", "project_id"),)

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False
    )
    success_metric_value: Mapped[str] = mapped_column(String(50), nullable=False)
    success_metric_label: Mapped[str] = mapped_column(String(150), nullable=False)
    sort_order: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=0, server_default=text("0")
    )

    project = relationship("Project", back_populates="success_metrics", lazy="raise")
