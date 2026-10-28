from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.permissions import require_permission
from app.api.dashboard.repository import DashboardRepository
from app.api.dashboard.usecase import DashboardUseCase
from app.api.projects.permissions import FINANCIAL_VIEW, has_permission
from app.connections.session import get_db
from app.core.responses import success_response
from app.models.user_model import User

router = APIRouter(
    prefix="/dashboard",
    tags=["Dashboard"],
)


def get_dashboard_use_case(
    db: AsyncSession = Depends(get_db),
) -> DashboardUseCase:
    return DashboardUseCase(DashboardRepository(db))


def get_dashboard_filters(
    search: str | None = Query(default=None),
    customer_name: str | None = Query(default=None),
    customer_location: str | None = Query(default=None),
    company_size_id: UUID | None = Query(default=None),
    customer_type_id: UUID | None = Query(default=None),
    industry_id: UUID | None = Query(default=None),
    legal_structure_id: UUID | None = Query(default=None),
    tech_stack_id: UUID | None = Query(default=None),
    project_status_id: UUID | None = Query(default=None),
    business_unit_id: UUID | None = Query(default=None),
    year: int | None = Query(default=None),
    is_featured: bool | None = Query(default=None),
) -> dict:
    return {
        "search": search,
        "customer_name": customer_name,
        "customer_location": customer_location,
        "company_size_id": company_size_id,
        "customer_type_id": customer_type_id,
        "industry_id": industry_id,
        "legal_structure_id": legal_structure_id,
        "tech_stack_id": tech_stack_id,
        "project_status_id": project_status_id,
        "business_unit_id": business_unit_id,
        "year": year,
        "is_featured": is_featured,
    }


@router.get("/summary")
async def summary(
    current_user: User = Depends(require_permission("portfolio.view")),
    db: AsyncSession = Depends(get_db),
    use_case: DashboardUseCase = Depends(get_dashboard_use_case),
    filters: dict = Depends(get_dashboard_filters),
):
    include_financial = await has_permission(db, current_user, FINANCIAL_VIEW)
    data = await use_case.summary(
        include_financial=include_financial,
        **filters,
    )
    return success_response(
        message="Ringkasan dashboard berhasil diambil.",
        data=data,
    )


@router.get("/projects-by-business-unit")
async def projects_by_business_unit(
    current_user: User = Depends(require_permission("portfolio.view")),
    db: AsyncSession = Depends(get_db),
    use_case: DashboardUseCase = Depends(get_dashboard_use_case),
    filters: dict = Depends(get_dashboard_filters),
):
    include_financial = await has_permission(db, current_user, FINANCIAL_VIEW)
    data = await use_case.projects_by_business_unit(
        include_financial=include_financial,
        **filters,
    )
    return success_response(
        message="Data project per business unit berhasil diambil.",
        data=data,
    )


@router.get("/projects-by-industry")
async def projects_by_industry(
    current_user: User = Depends(require_permission("portfolio.view")),
    db: AsyncSession = Depends(get_db),
    use_case: DashboardUseCase = Depends(get_dashboard_use_case),
    filters: dict = Depends(get_dashboard_filters),
):
    include_financial = await has_permission(db, current_user, FINANCIAL_VIEW)
    data = await use_case.projects_by_industry(
        include_financial=include_financial,
        **filters,
    )
    return success_response(
        message="Data project per industry berhasil diambil.",
        data=data,
    )
