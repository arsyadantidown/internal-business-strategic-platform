from fastapi import HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.lib.portfolio_import import (
    build_portfolio_import_template,
    read_portfolio_workbook,
)
from app.lib.portfolio_import_master_data import match_master_data


class ProjectImportUseCase:
    def __init__(self, db: AsyncSession):
        self.db = db

    def template(self) -> bytes:
        return build_portfolio_import_template()

    async def preview(
        self,
        file_content: bytes,
    ) -> dict:
        if not file_content:
            raise HTTPException(
                status_code=422,
                detail="File Excel kosong.",
            )

        try:
            preview = read_portfolio_workbook(
                file_content
            )
        except ValueError as exc:
            raise HTTPException(
                status_code=422,
                detail=str(exc),
            ) from exc

        preview = await match_master_data(
            self.db,
            preview,
        )

        return preview