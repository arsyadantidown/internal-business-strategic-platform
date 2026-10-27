from uuid import UUID
from sqlalchemy import select

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.dependencies import get_current_user
from app.api.auth.permissions import require_permission
from app.api.role_requests.schema import (
    RoleRequestCreate,
    RoleRequestResponse,
    RoleRequestReview,
)
from app.api.role_requests.usecase import RoleRequestUseCase
from app.connections.session import get_db
from app.models.user_model import User
from app.models.role_model import Role
from app.models.division_model import Division

router = APIRouter(
    prefix="/role-requests",
    tags=["Role Requests"],
)

def success_response(message: str, data):
    return {
        "success": True,
        "message": message,
        "data": data,
        "meta": None,
    }

async def serialize_role_request(db, request):
    role_result = await db.execute(
        select(Role).where(Role.id == request.requested_role_id)
    )
    role = role_result.scalar_one_or_none()

    division_result = await db.execute(
        select(Division).where(Division.id == request.division_id)
    )
    division = division_result.scalar_one_or_none()

    return RoleRequestResponse(
        id=request.id,
        user_id=request.user_id,
        requested_role_id=request.requested_role_id,
        division_id=request.division_id,
        role_name=role.name if role else "Unknown",
        division_name=division.name if division else "Unknown",
        reason=request.reason,
        status=request.status,
        reviewed_by=request.reviewed_by,
        reviewed_at=request.reviewed_at,
        review_notes=request.review_notes,
        created_at=request.created_at,
        updated_at=request.updated_at,
    ).model_dump(mode="json")

@router.post("", status_code=status.HTTP_201_CREATED)
async def create_role_request(
    payload: RoleRequestCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request = await RoleRequestUseCase(db).create(current_user, payload)

    return success_response(
        "Pengajuan role berhasil dibuat.",
        await serialize_role_request(db, request),
    )

@router.get("/me")
async def get_my_role_requests(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    request = await RoleRequestUseCase(db).get_my_request(current_user)

    data = (
        await serialize_role_request(db, request)
        if request is not None
        else None
    )

    return success_response(
        "Data pengajuan role berhasil diambil.",
        data,
    )

@router.get("")
async def get_all_role_requests(
    current_user: User = Depends(
        require_permission("role_request.review")
    ),
    db: AsyncSession = Depends(get_db),
):
    requests = await RoleRequestUseCase(db).get_all_requests()

    data = [
        await serialize_role_request(db, item)
        for item in requests
    ]

    return success_response("Daftar pengajuan role berhasil diambil.", data)

@router.patch("/{request_id}/review")
async def review_role_request(
    request_id: UUID,
    payload: RoleRequestReview,
    current_user: User = Depends(
        require_permission("role_request.review")
    ),
    db: AsyncSession = Depends(get_db),
):
    request = await RoleRequestUseCase(db).review(
        request_id,
        current_user,
        payload,
    )

    return success_response(
        "Pengajuan role berhasil direview.",
        await serialize_role_request(db, request),
    )
