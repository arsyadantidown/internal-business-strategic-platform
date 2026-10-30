from app.api.dashboard.repository import DashboardRepository


class DashboardUseCase:
    def __init__(self, repository: DashboardRepository):
        self.repository = repository

    async def summary(
        self,
        *,
        include_financial: bool,
        **filters,
    ) -> dict:
        data = await self.repository.summary(**filters)
        if not include_financial:
            data = dict(data)
            for key in ("total_value_before_tax", "total_revenue", "total_net_profit"):
                data.pop(key, None)
        return data

    async def projects_by_business_unit(
        self,
        *,
        include_financial: bool,
        **filters,
    ) -> list[dict]:
        rows = await self.repository.projects_by_business_unit(**filters)
        if not include_financial:
            rows = [dict(row) for row in rows]
            for row in rows:
                row.pop("total_value_before_tax", None)
        return rows

    async def projects_by_industry(
        self,
        *,
        include_financial: bool,
        **filters,
    ) -> list[dict]:
        rows = await self.repository.projects_by_industry(**filters)
        if not include_financial:
            rows = [dict(row) for row in rows]
            for row in rows:
                row.pop("total_value_before_tax", None)
        return rows
