from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import asc, desc, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from app.models.customer_model import Customer
from app.models.project_file_model import ProjectFile
from app.models.project_financial_model import ProjectFinancial
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

    async def list_projects(
        self,
        *,
        search: str | None = None,
        customer_name: str | None = None,
        customer_location: str | None = None,
        company_size_id: UUID | None = None,
        customer_type_id: UUID | None = None,
        industry_id: UUID | None = None,
        legal_structure_id: UUID | None = None,
        tech_stack_id: UUID | None = None,
        project_status_id: UUID | None = None,
        business_unit_id: UUID | None = None,
        year: int | None = None,
        is_featured: bool | None = None,
        page: int = 1,
        page_size: int = 12,
        sort: str = "-updated_at",
    ) -> tuple[list[Project], int]:
        conditions = [Project.deleted_at.is_(None)]

        if search:
            pattern = f"%{search.strip()}%"
            conditions.append(
                or_(
                    Project.project_name.ilike(pattern),
                    Project.project_code.ilike(pattern),
                    Customer.customer_name.ilike(pattern),
                    Project.contract_number.ilike(pattern),
                )
            )

        if customer_name:
            conditions.append(
                func.lower(Customer.customer_name)
                == customer_name.strip().lower()
            )

        if customer_location:
            conditions.append(
                func.lower(Customer.customer_location)
                == customer_location.strip().lower()
            )

        if company_size_id is not None:
            conditions.append(Customer.company_size_id == company_size_id)

        if customer_type_id is not None:
            conditions.append(Customer.customer_type_id == customer_type_id)

        if industry_id is not None:
            conditions.append(Customer.industry_id == industry_id)

        if legal_structure_id is not None:
            conditions.append(Customer.legal_structure_id == legal_structure_id)

        if tech_stack_id is not None:
            conditions.append(
                Project.tech_stacks.any(
                    ProjectTechStack.tech_stack_id == tech_stack_id
                )
            )

        if project_status_id is not None:
            conditions.append(Project.project_status_id == project_status_id)

        if business_unit_id is not None:
            conditions.append(Project.business_unit_id == business_unit_id)

        if year is not None:
            conditions.append(Project.year == year)

        if is_featured is not None:
            conditions.append(Project.is_featured == is_featured)

        net_profit = (
            Project.value_before_tax
            - func.coalesce(ProjectFinancial.cogs, 0)
            - func.coalesce(ProjectFinancial.operational_cost, 0)
        )

        sort_fields = {
            "updated_at": Project.updated_at,
            "start_date": Project.start_date,
            "end_date": Project.end_date,
            "project_name": Project.project_name,
            "project_code": Project.project_code,
            "year": Project.year,
            "customer_name": Customer.customer_name,
            "value_before_tax": Project.value_before_tax,
            "net_profit": net_profit,
        }

        descending = sort.startswith("-")
        sort_name = sort[1:] if descending else sort
        sort_column = sort_fields.get(sort_name, Project.updated_at)

        ordering = desc(sort_column) if descending else asc(sort_column)

        query = (
            select(Project)
            .outerjoin(Customer, Customer.project_id == Project.id)
            .outerjoin(
                ProjectFinancial,
                ProjectFinancial.project_id == Project.id,
            )
            .where(*conditions)
            .options(*project_load_options())
            .order_by(ordering, Project.id.asc())
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        count_query = (
            select(func.count(Project.id))
            .select_from(Project)
            .outerjoin(Customer, Customer.project_id == Project.id)
            .outerjoin(
                ProjectFinancial,
                ProjectFinancial.project_id == Project.id,
            )
            .where(*conditions)
        )

        projects = (
            (await self.db.execute(query))
            .unique()
            .scalars()
            .all()
        )

        total = (await self.db.execute(count_query)).scalar_one()

        return list(projects), total

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