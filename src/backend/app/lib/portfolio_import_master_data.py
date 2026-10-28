from sqlalchemy.ext.asyncio import AsyncSession

from app.api.master_data.repository import MasterDataRepository
from app.api.products.repository import ProductRepository
from app.api.tech_stacks.repository import TechStackRepository

from app.models.business_unit_model import BusinessUnit
from app.models.company_size_model import CompanySize
from app.models.customer_type_model import CustomerType
from app.models.industry_model import Industry
from app.models.legal_structure_model import LegalStructure
from app.models.project_status_model import ProjectStatus


def add_error(
    errors: list[dict[str, str]],
    field: str,
    code: str,
    message: str,
) -> None:
    errors.append(
        {
            "field": field,
            "code": code,
            "message": message,
        }
    )


async def match_master_data(
    db: AsyncSession,
    preview: dict,
) -> dict:
    """
    Mencocokkan hasil import preview dengan master data database.

    Lookup:
    - Customer Size -> company_sizes.code
    - Customer Type -> customer_types.name
    - Industry -> industries.name
    - Legal Structure -> legal_structures.name
    - Business Unit -> business_units.name
    - Project Status -> project_statuses.name
    - Product -> products.name
    - Frontend/Backend/Data Storage -> tech_stacks
    """

    company_size_repo = MasterDataRepository(
        db,
        CompanySize,
        "company_size",
    )

    customer_type_repo = MasterDataRepository(
        db,
        CustomerType,
        "customer_type",
    )

    industry_repo = MasterDataRepository(
        db,
        Industry,
        "industry",
    )

    legal_structure_repo = MasterDataRepository(
        db,
        LegalStructure,
        "legal_structure",
    )

    business_unit_repo = MasterDataRepository(
        db,
        BusinessUnit,
        "business_unit",
    )

    project_status_repo = MasterDataRepository(
        db,
        ProjectStatus,
        "project_status",
    )

    product_repo = ProductRepository(db)
    tech_stack_repo = TechStackRepository(db)

    for preview_row in preview["rows"]:
        data = preview_row["data"]
        errors = preview_row["errors"]

        # --------------------------------------------------
        # Customer Size
        # --------------------------------------------------

        customer_size_code = data.get(
            "customer_size_code"
        )

        if customer_size_code:
            item = await company_size_repo.get_by_code(
                customer_size_code
            )

            if item is None:
                add_error(
                    errors,
                    field="customer_size_code",
                    code="MASTER_DATA_NOT_FOUND",
                    message=(
                        "Customer Size tidak ditemukan "
                        "di master data"
                    ),
                )
            else:
                data["company_size_id"] = item.id

        # --------------------------------------------------
        # Customer Type
        # --------------------------------------------------

        customer_type = data.get(
            "customer_type"
        )

        if customer_type:
            item = await customer_type_repo.get_by_name(
                customer_type
            )

            if item is None:
                add_error(
                    errors,
                    field="customer_type",
                    code="MASTER_DATA_NOT_FOUND",
                    message=(
                        f"Customer Type '{customer_type}' "
                        "tidak ditemukan"
                    ),
                )
            else:
                data["customer_type_id"] = item.id

        # --------------------------------------------------
        # Industry
        # --------------------------------------------------

        industry = data.get("industry")

        if industry:
            item = await industry_repo.get_by_name(
                industry
            )

            if item is None:
                add_error(
                    errors,
                    field="industry",
                    code="MASTER_DATA_NOT_FOUND",
                    message=(
                        f"Industry '{industry}' "
                        "tidak ditemukan"
                    ),
                )
            else:
                data["industry_id"] = item.id

        # --------------------------------------------------
        # Legal Structure
        # --------------------------------------------------

        legal_structure = data.get(
            "legal_structure"
        )

        if legal_structure:
            item = (
                await legal_structure_repo.get_by_name(
                    legal_structure
                )
            )

            if item is None:
                add_error(
                    errors,
                    field="legal_structure",
                    code="MASTER_DATA_NOT_FOUND",
                    message=(
                        f"Legal Structure "
                        f"'{legal_structure}' "
                        "tidak ditemukan"
                    ),
                )
            else:
                data["legal_structure_id"] = item.id

        # --------------------------------------------------
        # Business Unit
        # --------------------------------------------------

        business_unit = data.get(
            "business_unit"
        )

        if business_unit:
            item = await business_unit_repo.get_by_name(
                business_unit
            )

            if item is None:
                add_error(
                    errors,
                    field="business_unit",
                    code="MASTER_DATA_NOT_FOUND",
                    message=(
                        f"Business Unit '{business_unit}' "
                        "tidak ditemukan"
                    ),
                )
            else:
                data["business_unit_id"] = item.id

        # --------------------------------------------------
        # Project Status
        # --------------------------------------------------

        project_status = data.get(
            "project_status"
        )

        if project_status:
            item = await project_status_repo.get_by_name(
                project_status
            )

            if item is None:
                add_error(
                    errors,
                    field="project_status",
                    code="MASTER_DATA_NOT_FOUND",
                    message=(
                        f"Project Status "
                        f"'{project_status}' "
                        "tidak ditemukan"
                    ),
                )
            else:
                data["project_status_id"] = item.id

        # --------------------------------------------------
        # Products
        # --------------------------------------------------

        product_ids = []

        for product_name in data.get(
            "products",
            [],
        ):
            product = await product_repo.get_by_name(
                product_name
            )

            if product is None:
                add_error(
                    errors,
                    field="products",
                    code="PRODUCT_NOT_FOUND",
                    message=(
                        f"Product '{product_name}' "
                        "tidak ditemukan"
                    ),
                )
            else:
                product_ids.append(product.id)

        data["product_ids"] = product_ids

        # --------------------------------------------------
        # Tech Stacks
        # --------------------------------------------------

        tech_stack_ids = []

        tech_stack_groups = {
            "frontend": data.get(
                "frontend",
                [],
            ),
            "backend": data.get(
                "backend",
                [],
            ),
            "data_storage": data.get(
                "data_storage",
                [],
            ),
        }

        for category, names in (
            tech_stack_groups.items()
        ):
            for tech_stack_name in names:
                tech_stack = (
                    await tech_stack_repo
                    .get_by_category_and_name(
                        category,
                        tech_stack_name,
                    )
                )

                if tech_stack is None:
                    add_error(
                        errors,
                        field=category,
                        code="TECH_STACK_NOT_FOUND",
                        message=(
                            f"Tech Stack "
                            f"'{tech_stack_name}' "
                            f"({category}) tidak ditemukan"
                        ),
                    )
                else:
                    tech_stack_ids.append(
                        tech_stack.id
                    )

        data["tech_stack_ids"] = tech_stack_ids

        preview_row["valid"] = (
            len(errors) == 0
        )

    # Hitung ulang summary setelah DB validation.
    preview["valid_rows"] = sum(
        1
        for row in preview["rows"]
        if row["valid"]
    )

    preview["invalid_rows"] = (
        preview["total_rows"]
        - preview["valid_rows"]
    )

    return preview