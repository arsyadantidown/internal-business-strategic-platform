import uuid
from datetime import datetime

from sqlalchemy import (
    BigInteger,
    CheckConstraint,
    DateTime,
    ForeignKey,
    Index,
    SmallInteger,
    String,
    Text,
    func,
    text,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base

FILE_CATEGORIES = ("image", "video", "document", "case_study")


class ProjectFile(Base):
    """Metadata file project. Isi file ada di bucket GCS privat (storage_key), bukan di database."""

    __tablename__ = "project_files"

    __table_args__ = (
        CheckConstraint(
            "file_category IN ('image', 'video', 'document', 'case_study')",
            name="ck_project_files_category",
        ),
        Index("ix_project_files_project_id", "project_id"),
        # Satu case study per project.
        Index(
            "uq_project_files_case_study_per_project",
            "project_id",
            unique=True,
            postgresql_where=text("file_category = 'case_study'"),
        ),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    project_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False
    )
    file_category: Mapped[str] = mapped_column(String(20), nullable=False)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_title: Mapped[str | None] = mapped_column(String(255))
    file_description: Mapped[str | None] = mapped_column(Text)
    mime_type: Mapped[str] = mapped_column(String(100), nullable=False)
    file_size_bytes: Mapped[int] = mapped_column(BigInteger, nullable=False)
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False, unique=True)
    sort_order: Mapped[int] = mapped_column(
        SmallInteger, nullable=False, default=0, server_default=text("0")
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )
    created_by: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="RESTRICT")
    )

    project = relationship("Project", back_populates="files", lazy="raise")
