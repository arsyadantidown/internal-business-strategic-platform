from math import ceil
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import aliased

from app.models.role_request_model import RoleRequest
from app.models.role_model import Role
from app.models.division_model import Division
from app.models.user_model import User

class RoleRequestRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_id(self, request_id: UUID) -> RoleRequest | None:
        result = await self.db.execute(
            select(RoleRequest).where(RoleRequest.id == request_id)
        )
        return result.scalar_one_or_none()

    async def get_pending_by_user(
        self, user_id: UUID
    ) -> RoleRequest | None:
        result = await self.db.execute(
            select(RoleRequest).where(
                RoleRequest.user_id == user_id,
                RoleRequest.status == "pending",
            )
        )
        return result.scalar_one_or_none()

    async def get_by_user(self, user_id: UUID) -> list[RoleRequest]:
        result = await self.db.execute(
            select(RoleRequest)
            .where(RoleRequest.user_id == user_id)
            .order_by(RoleRequest.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_all(
        self,
        status_filter: str | None = None,
        page: int = 1,
        page_size: int = 10,
    ) -> dict:
        requester = aliased(User, name="requester")
        reviewer = aliased(User, name="reviewer")

        filters = []
        if status_filter is not None:
            filters.append(RoleRequest.status == status_filter)

        count_query = (
            select(func.count(RoleRequest.id))
            .select_from(RoleRequest)
            .where(*filters)
        )
        count_result = await self.db.execute(count_query)
        total = count_result.scalar_one()

        query = (
            select(
                RoleRequest,
                requester.full_name.label("requester_name"),
                requester.email.label("requester_email"),
                Role.name.label("role_name"),
                Division.name.label("division_name"),
                reviewer.full_name.label("reviewer_name"),
                reviewer.email.label("reviewer_email"),
            )
            .join(requester, requester.id == RoleRequest.user_id)
            .join(Role, Role.id == RoleRequest.requested_role_id)
            .join(Division, Division.id == RoleRequest.division_id)
            .outerjoin(reviewer, reviewer.id == RoleRequest.reviewed_by)
            .where(*filters)
            .order_by(
                RoleRequest.created_at.desc(),
                RoleRequest.id.desc(),
            )
            .offset((page - 1) * page_size)
            .limit(page_size)
        )

        result = await self.db.execute(query)

        items = []
        for row in result.all():
            request = row[0]

            items.append({
                "id": request.id,
                "user_id": request.user_id,
                "requester_name": row.requester_name,
                "requester_email": row.requester_email,
                "requested_role_id": request.requested_role_id,
                "division_id": request.division_id,
                "role_name": row.role_name,
                "division_name": row.division_name,
                "reason": request.reason,
                "status": request.status,
                "reviewed_by": request.reviewed_by,
                "reviewer_name": row.reviewer_name,
                "reviewer_email": row.reviewer_email,
                "reviewed_at": request.reviewed_at,
                "review_notes": request.review_notes,
                "created_at": request.created_at,
                "updated_at": request.updated_at,
            })

        return {
            "items": items,
            "pagination": {
                "page": page,
                "page_size": page_size,
                "total": total,
                "total_pages": ceil(total / page_size) if total else 0,
            },
        }

    async def get_active_role(self, role_id: UUID) -> Role | None:
        result = await self.db.execute(
            select(Role).where(
                Role.id == role_id,
                Role.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def get_active_division(
        self, division_id: UUID
    ) -> Division | None:
        result = await self.db.execute(
            select(Division).where(
                Division.id == division_id,
                Division.is_active.is_(True),
            )
        )
        return result.scalar_one_or_none()

    async def get_user(self, user_id: UUID) -> User | None:
        result = await self.db.execute(
            select(User).where(User.id == user_id)
        )
        return result.scalar_one_or_none()

    async def create(self, request: RoleRequest) -> RoleRequest:
        self.db.add(request)
        await self.db.flush()
        return request

    async def save(self) -> None:
        await self.db.flush()

    async def get_latest_by_user(self, user_id: UUID) -> dict | None:
        requester = aliased(User, name="requester")
        reviewer = aliased(User, name="reviewer")

        result = await self.db.execute(
            select(
                RoleRequest,
                requester.full_name.label("requester_name"),
                requester.email.label("requester_email"),
                Division.name.label("division_name"),
                Role.name.label("role_name"),
                reviewer.full_name.label("reviewer_name"),
                reviewer.email.label("reviewer_email"),
            )
            .join(requester, requester.id == RoleRequest.user_id)
            .join(Division, Division.id == RoleRequest.division_id)
            .join(Role, Role.id == RoleRequest.requested_role_id)
            .outerjoin(reviewer, reviewer.id == RoleRequest.reviewed_by)
            .where(RoleRequest.user_id == user_id)
            .order_by(
                RoleRequest.created_at.desc(),
                RoleRequest.id.desc(),
            )
            .limit(1)
        )

        row = result.first()
        if row is None:
            return None

        request = row[0]

        return {
            "id": request.id,
            "user_id": request.user_id,
            "requester_name": row.requester_name,
            "requester_email": row.requester_email,
            "requested_role_id": request.requested_role_id,
            "division_id": request.division_id,
            "role_name": row.role_name,
            "division_name": row.division_name,
            "reason": request.reason,
            "status": request.status,
            "reviewed_by": request.reviewed_by,
            "reviewed_at": request.reviewed_at,
            "review_notes": request.review_notes,
            "reviewer_name": row.reviewer_name,
            "reviewer_email": row.reviewer_email,
            "created_at": request.created_at,
            "updated_at": request.updated_at,
        }