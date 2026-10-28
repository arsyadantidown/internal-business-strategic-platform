from sqlalchemy import case, func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.projects.repository import build_project_conditions
from app.models.business_unit_model import BusinessUnit
from app.models.customer_model import Customer
from app.models.industry_model import Industry
from app.models.project_financial_model import ProjectFinancial
from app.models.project_model import Project
from app.models.project_status_model import ProjectStatus


FINANCIAL_STATUS_CODES = ("ON_GOING", "CLOSED")


def _financial_total(expression):
    return func.coalesce(
        func.sum(
            case(
                (ProjectStatus.project_status_code.in_(FINANCIAL_STATUS_CODES), expression),
                else_=0,
            )
        ),
        0,
    )


class DashboardRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def summary(self, **filters) -> dict:
        conditions = build_project_conditions(**filters)
        net_profit = (
            Project.value_before_tax
            - func.coalesce(ProjectFinancial.cogs, 0)
            - func.coalesce(ProjectFinancial.operational_cost, 0)
        )
        total_value = _financial_total(Project.value_before_tax)

        query = (
            select(
                func.count(Project.id).label("total_projects"),
                func.count(
                    case((ProjectStatus.project_status_code == "ON_GOING", Project.id))
                ).label("active_projects"),
                total_value.label("total_value_before_tax"),
                total_value.label("total_revenue"),
                _financial_total(net_profit).label("total_net_profit"),
            )
            .select_from(Project)
            .join(ProjectStatus, Project.project_status_id == ProjectStatus.id)
            .outerjoin(Customer, Customer.project_id == Project.id)
            .outerjoin(ProjectFinancial, ProjectFinancial.project_id == Project.id)
            .where(*conditions)
        )
        status_query = (
            select(
                ProjectStatus.id.label("id"),
                ProjectStatus.project_status_code.label("code"),
                ProjectStatus.project_status_name.label("name"),
                func.count(Project.id).label("count"),
            )
            .select_from(Project)
            .join(ProjectStatus, Project.project_status_id == ProjectStatus.id)
            .outerjoin(Customer, Customer.project_id == Project.id)
            .where(*conditions)
            .group_by(
                ProjectStatus.id,
                ProjectStatus.project_status_code,
                ProjectStatus.project_status_name,
                ProjectStatus.sort_order,
            )
            .order_by(ProjectStatus.sort_order, ProjectStatus.project_status_name)
        )

        result = dict((await self.db.execute(query)).mappings().one())
        status_rows = (await self.db.execute(status_query)).mappings().all()
        result["status_counts"] = [dict(row) for row in status_rows]
        return result

    async def projects_by_business_unit(self, **filters) -> list[dict]:
        conditions = build_project_conditions(**filters)
        query = (
            select(
                BusinessUnit.id.label("id"),
                BusinessUnit.business_unit_code.label("code"),
                BusinessUnit.business_unit_name.label("name"),
                func.count(Project.id).label("project_count"),
                _financial_total(Project.value_before_tax).label("total_value_before_tax"),
            )
            .select_from(Project)
            .join(BusinessUnit, Project.business_unit_id == BusinessUnit.id)
            .join(ProjectStatus, Project.project_status_id == ProjectStatus.id)
            .outerjoin(Customer, Customer.project_id == Project.id)
            .where(*conditions)
            .group_by(
                BusinessUnit.id,
                BusinessUnit.business_unit_code,
                BusinessUnit.business_unit_name,
                BusinessUnit.sort_order,
            )
            .order_by(BusinessUnit.sort_order, BusinessUnit.business_unit_name)
        )
        rows = (await self.db.execute(query)).mappings().all()
        return [dict(row) for row in rows]

    async def projects_by_industry(self, **filters) -> list[dict]:
        conditions = build_project_conditions(**filters)
        query = (
            select(
                Industry.id.label("id"),
                Industry.industry_code.label("code"),
                Industry.industry_name.label("name"),
                func.count(Project.id).label("project_count"),
                _financial_total(Project.value_before_tax).label("total_value_before_tax"),
            )
            .select_from(Project)
            .join(Customer, Customer.project_id == Project.id)
            .join(Industry, Customer.industry_id == Industry.id)
            .join(ProjectStatus, Project.project_status_id == ProjectStatus.id)
            .where(*conditions)
            .group_by(
                Industry.id,
                Industry.industry_code,
                Industry.industry_name,
                Industry.sort_order,
            )
            .order_by(Industry.sort_order, Industry.industry_name)
        )
        rows = (await self.db.execute(query)).mappings().all()
        return [dict(row) for row in rows]
