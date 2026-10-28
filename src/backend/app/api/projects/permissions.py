from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.permission_model import Permission
from app.models.role_permission_model import RolePermission
from app.models.user_model import User

FINANCIAL_VIEW = "financial.view"


async def has_permission(db: AsyncSession, user: User, permission_code: str) -> bool:
    """Cek permission tanpa melempar 403 (untuk menyembunyikan field, bukan menolak request).
    require_permission() di app.api.auth.permissions tetap dipakai untuk menolak akses endpoint."""
    if user.role_id is None:
        return False

    found = await db.execute(
        select(Permission.id)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .where(RolePermission.role_id == user.role_id, Permission.code == permission_code)
    )
    return found.scalar_one_or_none() is not None
