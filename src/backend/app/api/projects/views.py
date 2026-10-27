from uuid import UUID

from fastapi import APIRouter, Depends, File, Form, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.permissions import require_permission
from app.api.projects.file_usecase import ProjectFileUseCase
from app.api.projects.permissions import FINANCIAL_VIEW, has_permission
from app.api.projects.repository import ProjectRepository
from app.api.projects.schema import (
    CustomerInput,
    FinancialInput,
    PartnersRequest,
    ProductsRequest,
    ProjectCreate,
    ProjectFileUpdate,
    ProjectUpdate,
    SuccessMetricsRequest,
    TechStacksRequest,
)
from app.api.projects.usecase import ProjectUseCase
from app.connections.session import get_db
from app.core.gcs import ObjectStorage, get_storage
from app.core.responses import success_response
from app.models.user_model import User

router = APIRouter(prefix="/projects", tags=["Projects"])


def get_project_use_case(db: AsyncSession = Depends(get_db)) -> ProjectUseCase:
    return ProjectUseCase(ProjectRepository(db))


def get_file_use_case(
    db: AsyncSession = Depends(get_db),
    storage: ObjectStorage = Depends(get_storage),
) -> ProjectFileUseCase:
    return ProjectFileUseCase(ProjectRepository(db), storage)


async def can_see_financial(db: AsyncSession, user: User) -> bool:
    return await has_permission(db, user, FINANCIAL_VIEW)


# ───────────────────────── project ─────────────────────────
@router.post("", status_code=201)
async def create_project(
    payload: ProjectCreate,
    current_user: User = Depends(require_permission("portfolio.manage")),
    db: AsyncSession = Depends(get_db),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    data = await use_case.create(payload, current_user.id, await can_see_financial(db, current_user))
    return success_response(message="Project berhasil ditambahkan.", data=data)


@router.patch("/{project_id}")
async def update_project(
    project_id: UUID,
    payload: ProjectUpdate,
    current_user: User = Depends(require_permission("portfolio.manage")),
    db: AsyncSession = Depends(get_db),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    data = await use_case.update(
        project_id, payload, current_user.id, await can_see_financial(db, current_user)
    )
    return success_response(message="Project berhasil diperbarui.", data=data)


@router.delete("/{project_id}")
async def delete_project(
    project_id: UUID,
    current_user: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    """Soft delete: baris tetap ada (deleted_at terisi) tapi tidak muncul lagi, dan project_code-nya bisa dipakai ulang."""
    await use_case.soft_delete(project_id, current_user.id)
    return success_response(message="Project berhasil dihapus.")


# ───────────────────────── PUT per perspektif (mengganti isinya) ─────────────────────────
@router.put("/{project_id}/customer")
async def put_customer(
    project_id: UUID,
    payload: CustomerInput,
    current_user: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    data = await use_case.put_customer(project_id, payload, current_user.id)
    return success_response(message="Customer project berhasil disimpan.", data=data)


@router.put("/{project_id}/financial")
async def put_financial(
    project_id: UUID,
    payload: FinancialInput,
    current_user: User = Depends(require_permission("portfolio.manage")),
    db: AsyncSession = Depends(get_db),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    data = await use_case.put_financial(
        project_id, payload, current_user.id, await can_see_financial(db, current_user)
    )
    return success_response(message="Data keuangan project berhasil disimpan.", data=data)


@router.put("/{project_id}/products")
async def put_products(
    project_id: UUID,
    payload: ProductsRequest,
    current_user: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    data = await use_case.put_products(project_id, payload.product_ids, current_user.id)
    return success_response(message="Product project berhasil disimpan.", data=data)


@router.put("/{project_id}/tech-stacks")
async def put_tech_stacks(
    project_id: UUID,
    payload: TechStacksRequest,
    current_user: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    data = await use_case.put_tech_stacks(project_id, payload.tech_stack_ids, current_user.id)
    return success_response(message="Tech stack project berhasil disimpan.", data=data)


@router.put("/{project_id}/partners")
async def put_partners(
    project_id: UUID,
    payload: PartnersRequest,
    current_user: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    data = await use_case.put_partners(project_id, payload.partners, current_user.id)
    return success_response(message="Partner project berhasil disimpan.", data=data)


@router.put("/{project_id}/success-metrics")
async def put_success_metrics(
    project_id: UUID,
    payload: SuccessMetricsRequest,
    current_user: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectUseCase = Depends(get_project_use_case),
):
    data = await use_case.put_success_metrics(project_id, payload.success_metrics, current_user.id)
    return success_response(message="Success metrics project berhasil disimpan.", data=data)


# ───────────────────────── file project (GCS) ─────────────────────────
@router.post("/{project_id}/files", status_code=201)
async def upload_project_file(
    project_id: UUID,
    file: UploadFile = File(...),
    file_category: str = Form(..., description="image, video, document, atau case_study"),
    file_title: str | None = Form(default=None, max_length=255),
    file_description: str | None = Form(default=None),
    sort_order: int = Form(default=0),
    current_user: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectFileUseCase = Depends(get_file_use_case),
):
    data = await use_case.upload(
        project_id,
        fileobj=file.file,
        filename=file.filename,
        declared_type=file.content_type,
        category=file_category,
        title=file_title,
        description=file_description,
        sort_order=sort_order,
        user_id=current_user.id,
    )
    return success_response(message="File project berhasil diunggah.", data=data)


@router.patch("/{project_id}/files/{file_id}")
async def update_project_file(
    project_id: UUID,
    file_id: UUID,
    payload: ProjectFileUpdate,
    _: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectFileUseCase = Depends(get_file_use_case),
):
    data = await use_case.update(project_id, file_id, payload)
    return success_response(message="Data file project berhasil diperbarui.", data=data)


@router.delete("/{project_id}/files/{file_id}")
async def delete_project_file(
    project_id: UUID,
    file_id: UUID,
    _: User = Depends(require_permission("portfolio.manage")),
    use_case: ProjectFileUseCase = Depends(get_file_use_case),
):
    await use_case.delete(project_id, file_id)
    return success_response(message="File project berhasil dihapus.")


@router.get("/{project_id}/files/{file_id}/download")
async def download_project_file(
    project_id: UUID,
    file_id: UUID,
    _: User = Depends(require_permission("portfolio.view")),
    use_case: ProjectFileUseCase = Depends(get_file_use_case),
):
    """Mengembalikan signed URL berumur pendek; file diunduh langsung dari bucket privat."""
    data = await use_case.download_link(project_id, file_id)
    return success_response(message="Link unduhan berhasil dibuat.", data=data)
