from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    Response,
    UploadFile,
)
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.permissions import require_permission
from app.api.project_import.usecase import ProjectImportUseCase
from app.connections.session import get_db
from app.core.responses import success_response
from app.models.user_model import User


router = APIRouter(
    prefix="/projects/import",
    tags=["Project Import"],
)


def get_project_import_use_case(
    db: AsyncSession = Depends(get_db),
) -> ProjectImportUseCase:
    return ProjectImportUseCase(db)


@router.get("/template")
def download_project_import_template(
    _portfolio_user: User = Depends(
        require_permission("portfolio.manage")
    ),
    use_case: ProjectImportUseCase = Depends(
        get_project_import_use_case
    ),
):
    file_content = use_case.template()

    return Response(
        content=file_content,
        media_type=(
            "application/vnd.openxmlformats-"
            "officedocument.spreadsheetml.sheet"
        ),
        headers={
            "Content-Disposition": (
                'attachment; filename="'
                'portfolio_import_template.xlsx"'
            )
        },
    )


@router.post("/preview")
async def preview_project_import(
    file: UploadFile = File(...),
    _portfolio_user: User = Depends(
        require_permission("portfolio.manage")
    ),
    _financial_user: User = Depends(
        require_permission("financial.view")
    ),
    use_case: ProjectImportUseCase = Depends(
        get_project_import_use_case
    ),
):
    filename = file.filename or ""

    if not filename.lower().endswith(".xlsx"):
        raise HTTPException(
            status_code=422,
            detail="File harus berformat .xlsx.",
        )

    file_content = await file.read()

    data = await use_case.preview(
        file_content
    )

    return success_response(
        message="Preview import portfolio berhasil diproses.",
        data=data,
    )