from difflib import SequenceMatcher
from uuid import UUID, uuid4

from fastapi import HTTPException
from fastapi.encoders import jsonable_encoder
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.partners.repository import PartnerRepository
from app.api.partners.schema import PartnerCreateRequest
from app.api.projects.repository import ProjectRepository
from app.api.projects.schema import CustomerInput, FinancialInput, ProjectCreate
from app.api.projects.usecase import CODE_TAKEN, check_references, create_project
from app.models.customer_model import Customer
from app.models.partner_model import Partner

from app.lib.portfolio_import import (
    build_portfolio_import_template,
    normalize_text,
    read_portfolio_workbook,
)
from app.lib.portfolio_import_master_data import match_master_data


CUSTOMER_NAME_SIMILARITY_THRESHOLD = 0.92


def _project_payload(data: dict, *, partners=()) -> ProjectCreate:
    """Map normalized fields; preview validates without unresolved partner IDs."""
    return ProjectCreate.model_validate({
        **{
            key: value for key, value in data.items()
            if key in ProjectCreate.model_fields
            and key not in {"customer", "financial", "partners"}
        },
        "customer": {
            key: value for key, value in data.items()
            if key in CustomerInput.model_fields
        },
        "financial": {
            key: value for key, value in data.items()
            if key in FinancialInput.model_fields and value is not None
        },
        "partners": list(partners),
    })


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

        repository = ProjectRepository(self.db)
        for row in preview["rows"]:
            project_code = row["data"].get("project_code")
            if project_code and await repository.code_exists(project_code):
                error = {
                    "field": "project_code",
                    "code": "PROJECT_CODE_EXISTS",
                    "message": CODE_TAKEN,
                }
                if error not in row["errors"]:
                    row["errors"].append(error)

        preview = await match_master_data(
            self.db,
            preview,
        )

        await self._validate_creation_rows(preview)
        await self._add_customer_similarity_warnings(preview)
        return preview

    async def _validate_creation_rows(self, preview: dict) -> None:
        for row in preview["rows"]:
            data = row["data"]
            errors = row["errors"]
            try:
                _project_payload(data)
            except ValidationError as exc:
                for item in exc.errors(include_input=False, include_context=False):
                    location = item["loc"]
                    if location and location[0] in {"customer", "financial"}:
                        location = location[1:]
                    field = ".".join(str(part) for part in location) or "end_date"
                    field = {
                        "business_unit_id": "business_unit",
                        "project_status_id": "project_status",
                    }.get(field, field)
                    # Basic/parser errors already describe these fields precisely.
                    if not any(error["field"] == field for error in errors):
                        errors.append({
                            "field": field,
                            "code": "SCHEMA_VALIDATION_ERROR",
                            "message": item["msg"],
                        })

            # Validate resolved IDs even when another field failed schema validation.
            try:
                await check_references(
                    self.db,
                    business_unit_id=data.get("business_unit_id"),
                    project_status_id=data.get("project_status_id"),
                    customer={
                        key: value for key, value in data.items()
                        if key in CustomerInput.model_fields
                    },
                    product_ids=data.get("product_ids"),
                    tech_stack_ids=data.get("tech_stack_ids"),
                )
            except HTTPException as exc:
                if exc.status_code != 422 or not isinstance(exc.detail, dict):
                    raise
                for problem in exc.detail["details"]:
                    error = {
                        "field": problem["field"].removeprefix("customer."),
                        "code": "INVALID_REFERENCE",
                        "message": problem["reason"],
                    }
                    if error not in errors:
                        errors.append(error)
            row["valid"] = not errors

        preview["valid_rows"] = sum(row["valid"] for row in preview["rows"])
        preview["invalid_rows"] = preview["total_rows"] - preview["valid_rows"]

    async def _add_customer_similarity_warnings(self, preview: dict) -> None:
        if not preview["rows"]:
            return

        names = (await self.db.execute(select(Customer.customer_name).distinct())).scalars().all()
        normalized_names = {name for value in names if (name := normalize_text(value))}
        # Stable ordering resolves equal scores and differently cased duplicates.
        existing_names = {}
        for name in sorted(normalized_names, key=lambda value: (value.casefold(), value)):
            existing_names.setdefault(name.casefold(), name)

        for row in preview["rows"]:
            name = normalize_text(row["data"].get("customer_name"))
            if not name or name.casefold() in existing_names:
                continue

            best_name = None
            best_score = 0.0
            for normalized, existing_name in existing_names.items():
                score = SequenceMatcher(
                    None, name.casefold(), normalized, autojunk=False
                ).ratio()
                if score > best_score:
                    best_name = existing_name
                    best_score = score

            # Similarity is advisory only; errors, validity and counts stay unchanged.
            if best_name is not None and best_score >= CUSTOMER_NAME_SIMILARITY_THRESHOLD:
                warning = {
                    "field": "customer_name",
                    "code": "SIMILAR_CUSTOMER_NAME",
                    "message": f"Nama customer mirip dengan customer yang sudah ada: {best_name}",
                }
                if warning not in row["warnings"]:
                    row["warnings"].append(warning)

    async def confirm(self, file_content: bytes, *, created_by: UUID) -> dict:
        # Permission checks may already have started this session's transaction.
        # All writes below share it; only this method commits or rolls back.
        try:
            preview = await self.preview(file_content)
            if not preview["rows"]:
                raise HTTPException(422, "File Excel tidak memiliki baris untuk diimport.")

            errors = [
                {"row": row["row"], "errors": row["errors"]}
                for row in preview["rows"]
                if row["errors"]
            ]
            if errors:
                raise self._validation_error(errors)

            partner_repository = PartnerRepository(self.db)
            partners_by_name = {}
            new_partners = []
            new_partner_ids = set()
            payloads = []
            for row in preview["rows"]:
                data = row["data"]
                try:
                    links = []
                    for item in data.get("partners", []):
                        name = PartnerCreateRequest(
                            partner_name=item["partner_name"]
                        ).partner_name
                        key = name.lower()
                        partner = partners_by_name.get(key)
                        if partner is None:
                            partner = await partner_repository.get_by_name(name)
                            if partner is None:
                                # Assign an ID for schema validation, without inserting yet.
                                partner = Partner(
                                    id=uuid4(), partner_name=name, is_active=True
                                )
                                new_partners.append(partner)
                                new_partner_ids.add(partner.id)
                            partners_by_name[key] = partner
                        links.append({
                            "partner_id": partner.id,
                            "partner_role": item["partner_role"],
                        })

                    payload = _project_payload(data, partners=links)
                    await check_references(
                        self.db,
                        business_unit_id=payload.business_unit_id,
                        project_status_id=payload.project_status_id,
                        customer=payload.customer.model_dump(),
                        product_ids=payload.product_ids,
                        tech_stack_ids=payload.tech_stack_ids,
                        partner_ids=[
                            link.partner_id for link in payload.partners
                            if link.partner_id not in new_partner_ids
                        ],
                    )
                    payloads.append((row["row"], payload))
                except ValidationError as exc:
                    errors.append({
                        "row": row["row"],
                        "errors": [
                            {
                                "field": ".".join(str(part) for part in error["loc"]),
                                "code": error["type"],
                                "message": error["msg"],
                            }
                            for error in exc.errors(include_input=False, include_context=False)
                        ],
                    })
                except HTTPException as exc:
                    errors.append({"row": row["row"], "errors": [exc.detail]})

            if errors:
                raise self._validation_error(errors)

            for partner in new_partners:
                await partner_repository.create(partner)

            projects = []
            for row_number, payload in payloads:
                try:
                    project = await create_project(self.db, payload, created_by=created_by)
                except HTTPException as exc:
                    raise HTTPException(
                        status_code=exc.status_code,
                        detail={
                            "code": "IMPORT_FAILED",
                            "message": "Import project gagal. Tidak ada data yang disimpan.",
                            "details": jsonable_encoder({
                                "rows": [{"row": row_number, "errors": [exc.detail]}]
                            }),
                        },
                    ) from exc
                projects.append({"id": str(project.id), "project_code": project.project_code})

            await self.db.commit()
            return {"imported_count": len(projects), "projects": projects}
        except IntegrityError as exc:
            await self.db.rollback()
            raise HTTPException(
                409, "Data import bentrok dengan data yang sudah ada. Tidak ada data yang disimpan."
            ) from exc
        except BaseException:
            await self.db.rollback()
            raise

    @staticmethod
    def _validation_error(rows: list[dict]) -> HTTPException:
        return HTTPException(
            status_code=422,
            detail={
                "code": "IMPORT_VALIDATION_ERROR",
                "message": "Validasi import gagal. Tidak ada data yang disimpan.",
                "details": jsonable_encoder({"rows": rows}),
            },
        )
