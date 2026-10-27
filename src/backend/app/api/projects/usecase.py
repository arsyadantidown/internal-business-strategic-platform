from datetime import datetime, timezone
from uuid import UUID

from fastapi import HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.projects import calculations as calc
from app.api.projects.references import ReferenceChecker
from app.api.projects.repository import ProjectRepository
from app.api.projects.schema import (
    CustomerInput,
    FinancialInput,
    PartnerInput,
    ProjectCreate,
    ProjectUpdate,
    SuccessMetricInput,
)
from app.api.projects.serializers import (
    financial_numbers,
    serialize_customer,
    serialize_money,
    serialize_partners,
    serialize_project,
    serialize_project_list_item,
    serialize_success_metrics,
    serialize_tech_stack,
)
from app.models.business_unit_model import BusinessUnit
from app.models.company_size_model import CompanySize
from app.models.customer_model import Customer
from app.models.customer_type_model import CustomerType
from app.models.industry_model import Industry
from app.models.legal_structure_model import LegalStructure
from app.models.partner_model import Partner
from app.models.product_model import Product
from app.models.project_financial_model import ProjectFinancial
from app.models.project_model import Project
from app.models.project_partner_model import ProjectPartner
from app.models.project_product_model import ProjectProduct
from app.models.project_status_model import ProjectStatus
from app.models.project_success_metric_model import ProjectSuccessMetric
from app.models.project_tech_stack_model import ProjectTechStack
from app.models.tech_stack_model import TechStack

CODE_TAKEN = "Project ID (project_code) sudah digunakan oleh project lain."

PROJECT_LIST_SORT_FIELDS = {
    "updated_at",
    "start_date",
    "end_date",
    "project_name",
    "project_code",
    "year",
    "customer_name",
    "value_before_tax",
    "net_profit",
}

FINANCIAL_SORT_FIELDS = {
    "value_before_tax",
    "net_profit",
}


def duplicate_code_error() -> HTTPException:
    return HTTPException(409, CODE_TAKEN)


def date_range_error() -> HTTPException:
    return HTTPException(
        422,
        detail={
            "code": "INVALID_DATE_RANGE",
            "message": "end_date harus setelah start_date.",
            "details": None,
        },
    )


async def check_references(
    db: AsyncSession,
    *,
    business_unit_id=None,
    project_status_id=None,
    customer: dict | None = None,
    product_ids=None,
    tech_stack_ids=None,
    partner_ids=None,
    keep_products=(),
    keep_tech_stacks=(),
    keep_partners=(),
) -> None:
    """Pastikan semua id master data ada (dan aktif), lalu balas satu error 422 yang menyebut semuanya.
    Item yang sudah terpasang boleh tetap ada walau master-nya kini nonaktif (keep_*)."""
    checker = ReferenceChecker(db)

    if business_unit_id is not None:
        await checker.check("business_unit_id", BusinessUnit, [business_unit_id])
    if project_status_id is not None:
        await checker.check("project_status_id", ProjectStatus, [project_status_id])

    if customer:
        for field, model in (
            ("company_size_id", CompanySize),
            ("customer_type_id", CustomerType),
            ("industry_id", Industry),
            ("legal_structure_id", LegalStructure),
        ):
            if customer.get(field) is not None:
                await checker.check(f"customer.{field}", model, [customer[field]])

    if product_ids:
        await checker.check("product_ids", Product, set(product_ids) - set(keep_products))
    if tech_stack_ids:
        await checker.check("tech_stack_ids", TechStack, set(tech_stack_ids) - set(keep_tech_stacks))
    if partner_ids:
        await checker.check("partners", Partner, set(partner_ids) - set(keep_partners))

    checker.raise_if_invalid()


async def create_project(
    db: AsyncSession, payload: ProjectCreate, *, created_by: UUID | None
) -> Project:
    """Membuat project beserta semua perspektifnya dalam satu transaksi.

    Dipakai bersama oleh POST /projects dan import Excel. Fungsi ini TIDAK commit: pemanggil yang
    memutuskan (commit sekali di akhir, atau rollback bila ada baris lain yang gagal). Melempar
    HTTPException 409 untuk project_code ganda dan 422 untuk id master data yang tidak valid."""
    repository = ProjectRepository(db)

    await check_references(
        db,
        business_unit_id=payload.business_unit_id,
        project_status_id=payload.project_status_id,
        customer=payload.customer.model_dump(),
        product_ids=payload.product_ids,
        tech_stack_ids=payload.tech_stack_ids,
        partner_ids=[item.partner_id for item in payload.partners],
    )

    if await repository.code_exists(payload.project_code):
        raise duplicate_code_error()

    project = Project(
        **payload.model_dump(
            exclude={"customer", "financial", "product_ids", "tech_stack_ids", "partners", "success_metrics"}
        ),
        created_by=created_by,
        updated_by=created_by,
    )
    repository.add(project)
    await repository.flush()

    repository.add(Customer(project_id=project.id, created_by=created_by, **payload.customer.model_dump()))
    repository.add(
        ProjectFinancial(
            project_id=project.id,
            created_by=created_by,
            updated_by=created_by,
            **payload.financial.model_dump(),
        )
    )
    for product_id in dict.fromkeys(payload.product_ids):
        repository.add(ProjectProduct(project_id=project.id, product_id=product_id))
    for tech_stack_id in dict.fromkeys(payload.tech_stack_ids):
        repository.add(ProjectTechStack(project_id=project.id, tech_stack_id=tech_stack_id))
    for item in payload.partners:
        repository.add(ProjectPartner(project_id=project.id, **item.model_dump()))
    for item in payload.success_metrics:
        repository.add(ProjectSuccessMetric(project_id=project.id, **item.model_dump()))

    await repository.flush()
    return project


class ProjectUseCase:
    def __init__(self, repository: ProjectRepository):
        self.repository = repository
        self.db = repository.db

    # ------------------------------------------------------------------ helpers
    async def _get_or_404(self, project_id: UUID) -> Project:
        project = await self.repository.get_project(project_id)
        if project is None:
            raise HTTPException(404, "Project tidak ditemukan.")
        return project

    async def _commit(self) -> None:
        try:
            await self.repository.save()
        except IntegrityError as error:
            await self.repository.rollback()
            # Dua request bersamaan dengan kode sama: pemeriksaan di atas lolos keduanya, indeks unik menolak satu.
            if "project_code" in str(error.orig):
                raise duplicate_code_error()
            raise HTTPException(409, "Data bentrok dengan data yang sudah ada.")

    async def _detail(self, project_id: UUID, include_financial: bool) -> dict:
        project = await self._get_or_404(project_id)
        return serialize_project(project, calc.today_wib(), include_financial=include_financial)

    # ------------------------------------------------------------------ project
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
        include_financial: bool = False,
    ) -> dict:
        if page < 1:
            raise HTTPException(422, "page minimal 1.")

        if page_size < 1 or page_size > 100:
            raise HTTPException(
                422,
                "page_size harus antara 1 sampai 100.",
            )

        sort_name = sort[1:] if sort.startswith("-") else sort

        if sort_name not in PROJECT_LIST_SORT_FIELDS:
            raise HTTPException(
                422,
                "sort tidak valid.",
            )

        if (
            sort_name in FINANCIAL_SORT_FIELDS
            and not include_financial
        ):
            raise HTTPException(
                403,
                "Tidak memiliki permission untuk sorting data financial.",
            )

        projects, total = await self.repository.list_projects(
            search=search,
            customer_name=customer_name,
            customer_location=customer_location,
            company_size_id=company_size_id,
            customer_type_id=customer_type_id,
            industry_id=industry_id,
            legal_structure_id=legal_structure_id,
            tech_stack_id=tech_stack_id,
            project_status_id=project_status_id,
            business_unit_id=business_unit_id,
            year=year,
            is_featured=is_featured,
            page=page,
            page_size=page_size,
            sort=sort,
        )

        today = calc.today_wib()

        items = [
            serialize_project_list_item(
                project,
                today,
                include_financial=include_financial,
            )
            for project in projects
        ]

        total_pages = (
            (total + page_size - 1) // page_size
            if total > 0
            else 0
        )

        return {
            "items": items,
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": total_pages,
        }

    async def create(self, payload: ProjectCreate, user_id: UUID | None, include_financial: bool) -> dict:
        project = await create_project(self.db, payload, created_by=user_id)
        project_id = project.id
        await self._commit()
        return await self._detail(project_id, include_financial)

    async def update(
        self, project_id: UUID, payload: ProjectUpdate, user_id: UUID | None, include_financial: bool
    ) -> dict:
        project = await self._get_or_404(project_id)
        changes = payload.model_dump(exclude_unset=True)

        if not changes:
            raise HTTPException(400, "Tidak ada data yang diperbarui.")

        for field, value in changes.items():
            # Kolom NOT NULL tidak boleh dikosongkan; yang boleh null: opsional/teks.
            if value is None and field in NOT_NULL_FIELDS:
                raise HTTPException(422, f"{field} tidak boleh null.")

        await check_references(
            self.db,
            business_unit_id=changes.get("business_unit_id"),
            project_status_id=changes.get("project_status_id"),
        )

        start = changes.get("start_date", project.start_date)
        end = changes.get("end_date", project.end_date)
        if end <= start:
            raise date_range_error()

        if "project_code" in changes and await self.repository.code_exists(
            changes["project_code"], exclude_id=project.id
        ):
            raise duplicate_code_error()

        for field, value in changes.items():
            setattr(project, field, value)
        project.updated_by = user_id

        await self._commit()
        return await self._detail(project_id, include_financial)

    async def soft_delete(self, project_id: UUID, user_id: UUID | None) -> None:
        project = await self._get_or_404(project_id)
        project.deleted_at = datetime.now(timezone.utc)
        project.updated_by = user_id
        await self._commit()

    # ------------------------------------------------------------------ PUT perspektif
    async def put_customer(self, project_id: UUID, payload: CustomerInput, user_id: UUID | None) -> dict:
        project = await self._get_or_404(project_id)
        values = payload.model_dump()
        await check_references(self.db, customer=values)

        if project.customer is None:
            self.repository.add(Customer(project_id=project.id, created_by=user_id, **values))
        else:
            for field, value in values.items():
                setattr(project.customer, field, value)
        project.updated_by = user_id

        await self._commit()
        return serialize_customer(await self._get_or_404(project_id))

    async def put_financial(
        self, project_id: UUID, payload: FinancialInput, user_id: UUID | None, include_financial: bool
    ) -> dict | None:
        project = await self._get_or_404(project_id)
        values = payload.model_dump()

        if project.financial is None:
            self.repository.add(
                ProjectFinancial(project_id=project.id, created_by=user_id, updated_by=user_id, **values)
            )
        else:
            for field, value in values.items():
                setattr(project.financial, field, value)
            project.financial.updated_by = user_id
        project.updated_by = user_id

        await self._commit()

        # Penulis boleh mengisi angka tanpa financial.view, tapi tidak boleh membacanya kembali.
        if not include_financial:
            return None
        return serialize_money(await self._get_or_404(project_id))["financial"]

    async def put_products(self, project_id: UUID, product_ids: list[UUID], user_id: UUID | None) -> dict:
        project = await self._get_or_404(project_id)
        wanted = set(product_ids)
        existing = {link.product_id: link for link in project.products}

        await check_references(self.db, product_ids=wanted, keep_products=existing)

        for product_id, link in existing.items():
            if product_id not in wanted:
                project.products.remove(link)
        for product_id in wanted - set(existing):
            self.repository.add(ProjectProduct(project_id=project.id, product_id=product_id))
        project.updated_by = user_id

        await self._commit()
        return {"products": serialize_tech_stack(await self._get_or_404(project_id))["products"]}

    async def put_tech_stacks(self, project_id: UUID, tech_stack_ids: list[UUID], user_id: UUID | None) -> dict:
        project = await self._get_or_404(project_id)
        wanted = set(tech_stack_ids)
        existing = {link.tech_stack_id: link for link in project.tech_stacks}

        await check_references(self.db, tech_stack_ids=wanted, keep_tech_stacks=existing)

        for tech_stack_id, link in existing.items():
            if tech_stack_id not in wanted:
                project.tech_stacks.remove(link)
        for tech_stack_id in wanted - set(existing):
            self.repository.add(ProjectTechStack(project_id=project.id, tech_stack_id=tech_stack_id))
        project.updated_by = user_id

        await self._commit()
        stack = serialize_tech_stack(await self._get_or_404(project_id))
        return {key: stack[key] for key in ("frontend", "backend", "data_storage")}

    async def put_partners(self, project_id: UUID, partners: list[PartnerInput], user_id: UUID | None) -> list[dict]:
        project = await self._get_or_404(project_id)
        wanted = {(item.partner_id, item.partner_role): item for item in partners}
        existing = {(link.partner_id, link.partner_role): link for link in project.partners}

        await check_references(
            self.db,
            partner_ids=[key[0] for key in wanted],
            keep_partners={key[0] for key in existing},
        )

        for key, link in existing.items():
            if key not in wanted:
                project.partners.remove(link)
            else:
                link.partner_contribution = wanted[key].partner_contribution
        for key, item in wanted.items():
            if key not in existing:
                self.repository.add(ProjectPartner(project_id=project.id, **item.model_dump()))
        project.updated_by = user_id

        await self._commit()
        return serialize_partners(await self._get_or_404(project_id))

    async def put_success_metrics(
        self, project_id: UUID, metrics: list[SuccessMetricInput], user_id: UUID | None
    ) -> list[dict]:
        project = await self._get_or_404(project_id)

        # Daftar diganti seluruhnya: id baris metric tidak dianggap stabil bagi klien.
        for item in list(project.success_metrics):
            project.success_metrics.remove(item)
        await self.repository.flush()
        for item in metrics:
            self.repository.add(ProjectSuccessMetric(project_id=project.id, **item.model_dump()))
        project.updated_by = user_id

        await self._commit()
        return serialize_success_metrics(await self._get_or_404(project_id))


# Kolom projects yang NOT NULL: boleh diubah, tapi tidak boleh dikosongkan lewat PATCH.
NOT_NULL_FIELDS = {
    "project_code",
    "project_name",
    "year",
    "business_unit_id",
    "project_status_id",
    "value_before_tax",
    "start_date",
    "end_date",
    "is_featured",
}
