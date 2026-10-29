from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.customer_model import Customer
from app.models.project_model import Project

def _group_key(column):
    # "PT ABC Bank", "pt abc bank" dan "PT  ABC Bank " jadi satu kelompok.
    return func.lower(func.regexp_replace(func.trim(column), r"\s+", " ", "g"))

class CustomerRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_distinct_values(self, column, search: str | None = None) -> list[str]:
        """Satu nilai per kelompok, memakai penulisan yang paling sering dipakai
        (seri: penulisan yang urut abjad lebih dulu). Hanya dari project yang belum dihapus."""
        key = _group_key(column).label("group_key")
        value = func.trim(column).label("value")

        counted = (
            select(key, value, func.count().label("total"))
            .select_from(Customer)
            .join(Project, Project.id == Customer.project_id)
            .where(
                Project.deleted_at.is_(None),
                column.is_not(None),
                func.trim(column) != "",
            )
            .group_by(key, value)
        )

        if search:
            # Dicek pada kunci kelompok, supaya semua penulisan dalam satu kelompok ikut dihitung.
            counted = counted.where(_group_key(column).ilike(f"%{search}%"))

        counted = counted.subquery()
        ranked = select(
            counted.c.group_key,
            counted.c.value,
            func.row_number()
            .over(
                partition_by=counted.c.group_key,
                order_by=(counted.c.total.desc(), counted.c.value.asc()),
            )
            .label("rank"),
        ).subquery()

        result = await self.db.execute(
            select(ranked.c.value)
            .where(ranked.c.rank == 1)
            .order_by(ranked.c.group_key.asc())
        )
        return list(result.scalars().all())

    async def get_names(self, search: str | None = None) -> list[str]:
        return await self.get_distinct_values(Customer.customer_name, search)

    async def get_locations(self) -> list[str]:
        return await self.get_distinct_values(Customer.customer_location)
