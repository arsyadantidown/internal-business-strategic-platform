from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.models.customer_model import Customer
from app.models.project_file_model import ProjectFile
from app.models.project_model import Project
from app.models.project_partner_model import ProjectPartner
from app.models.project_product_model import ProjectProduct
from app.models.project_tech_stack_model import ProjectTechStack


def project_load_options():
    """Semua yang dibutuhkan serializer, supaya tidak ada query tambahan per baris."""
    return (
        joinedload(Project.business_unit),
        joinedload(Project.project_status),
        selectinload(Project.customer).options(
            joinedload(Customer.company_size),
            joinedload(Customer.customer_type),
            joinedload(Customer.industry),
            joinedload(Customer.legal_structure),
        ),
        selectinload(Project.financial),
        selectinload(Project.products).joinedload(ProjectProduct.product),
        selectinload(Project.tech_stacks).joinedload(ProjectTechStack.tech_stack),
        selectinload(Project.partners).joinedload(ProjectPartner.partner),
        selectinload(Project.success_metrics),
        selectinload(Project.files),
    )


class ProjectRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_project(self, project_id: UUID) -> Project | None:
        """Project yang belum dihapus, lengkap dengan semua perspektifnya.
        populate_existing: setelah update, objek yang sudah ada di session ikut disegarkan."""
        result = await self.db.execute(
            select(Project)
            .where(Project.id == project_id, Project.deleted_at.is_(None))
            .options(*project_load_options())
            .execution_options(populate_existing=True)
        )
        return result.unique().scalar_one_or_none()

    async def code_exists(self, project_code: str, exclude_id: UUID | None = None) -> bool:
        query = select(Project.id).where(
            func.lower(Project.project_code) == project_code.strip().lower(),
            Project.deleted_at.is_(None),
        )
        if exclude_id is not None:
            query = query.where(Project.id != exclude_id)
        return (await self.db.execute(query)).first() is not None

    async def get_file(self, project_id: UUID, file_id: UUID) -> ProjectFile | None:
        result = await self.db.execute(
            select(ProjectFile).where(ProjectFile.id == file_id, ProjectFile.project_id == project_id)
        )
        return result.scalar_one_or_none()

    async def project_is_live(self, project_id: UUID) -> bool:
        result = await self.db.execute(
            select(Project.id).where(Project.id == project_id, Project.deleted_at.is_(None))
        )
        return result.first() is not None

    async def case_study_exists(self, project_id: UUID, exclude_file_id: UUID | None = None) -> bool:
        query = select(ProjectFile.id).where(
            ProjectFile.project_id == project_id, ProjectFile.file_category == "case_study"
        )
        if exclude_file_id is not None:
            query = query.where(ProjectFile.id != exclude_file_id)
        return (await self.db.execute(query)).first() is not None

    def add(self, item) -> None:
        self.db.add(item)

    async def delete(self, item) -> None:
        await self.db.delete(item)

    async def flush(self) -> None:
        await self.db.flush()

    async def save(self) -> None:
        await self.db.commit()

    async def rollback(self) -> None:
        await self.db.rollback()

    @staticmethod
    def now() -> datetime:
        return datetime.now(timezone.utc)
