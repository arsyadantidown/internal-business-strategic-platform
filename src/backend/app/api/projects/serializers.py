"""Model ORM -> dict untuk response. Semua relasi yang dibaca di sini harus sudah di-load oleh repository
(relationship dibuat lazy="raise" supaya kelupaan load langsung ketahuan, bukan diam-diam query tambahan)."""

from datetime import date
from decimal import Decimal

from app.api.projects import calculations as calc
from app.api.projects.schema import ProjectRead, ProjectReadWithFinancial
from app.models.project_model import Project
from app.settings import settings

TECH_STACK_CATEGORIES = ("frontend", "backend", "data_storage")


def ref(item, prefix: str) -> dict | None:
    """Master data (company_sizes, industries, ...) sebagai {id, code, name}."""
    if item is None:
        return None
    return {
        "id": item.id,
        "code": getattr(item, f"{prefix}_code"),
        "name": getattr(item, f"{prefix}_name"),
    }


def serialize_customer(project: Project) -> dict | None:
    customer = project.customer
    if customer is None:
        return None
    return {
        "id": customer.id,
        "customer_name": customer.customer_name,
        "customer_location": customer.customer_location,
        "annual_revenue": customer.annual_revenue,
        "company_size": ref(customer.company_size, "company_size"),
        "customer_type": ref(customer.customer_type, "customer_type"),
        "industry": ref(customer.industry, "industry"),
        "legal_structure": ref(customer.legal_structure, "legal_structure"),
    }


def financial_numbers(project: Project) -> dict:
    """Angka keuangan. Revenue = value_before_tax (rumus Excel), net profit = revenue - cogs - biaya operasional."""
    financial = project.financial
    cogs = financial.cogs if financial else Decimal("0")
    operational_cost = financial.operational_cost if financial else Decimal("0")
    revenue = project.value_before_tax
    profit = calc.net_profit(revenue, cogs, operational_cost)

    return {
        "revenue": revenue,
        "cogs": cogs,
        "operational_cost": operational_cost,
        "net_profit": profit,
        "net_margin_percent": calc.net_margin_percent(revenue, profit),
    }


def serialize_tech_stack(project: Project) -> dict:
    grouped: dict[str, list[dict]] = {category: [] for category in TECH_STACK_CATEGORIES}

    for link in project.tech_stacks:
        item = link.tech_stack
        grouped.setdefault(item.tech_stack_category, []).append(
            {"id": item.id, "name": item.tech_stack_name}
        )

    for items in grouped.values():
        items.sort(key=lambda entry: entry["name"].lower())

    products = sorted(
        ({"id": link.product.id, "name": link.product.product_name} for link in project.products),
        key=lambda entry: entry["name"].lower(),
    )

    return {"products": products, **grouped}


def serialize_partners(project: Project) -> list[dict]:
    return sorted(
        (
            {
                "partner_id": link.partner.id,
                "partner_name": link.partner.partner_name,
                "partner_role": link.partner_role,
                "partner_contribution": link.partner_contribution,
            }
            for link in project.partners
        ),
        key=lambda entry: (entry["partner_role"], entry["partner_name"].lower()),
    )


def serialize_success_metrics(project: Project) -> list[dict]:
    return [
        {
            "id": item.id,
            "success_metric_value": item.success_metric_value,
            "success_metric_label": item.success_metric_label,
            "sort_order": item.sort_order,
        }
        for item in sorted(project.success_metrics, key=lambda m: (m.sort_order, m.success_metric_label))
    ]


def serialize_file(item) -> dict:
    """Metadata file. storage_key sengaja tidak ikut: itu detail internal bucket."""
    return {
        "id": item.id,
        "project_id": item.project_id,
        "file_category": item.file_category,
        "file_name": item.file_name,
        "file_title": item.file_title,
        "file_description": item.file_description,
        "mime_type": item.mime_type,
        "file_size_bytes": item.file_size_bytes,
        "sort_order": item.sort_order,
        "created_at": item.created_at,
    }


def serialize_files(project: Project) -> list[dict]:
    return [
        serialize_file(item)
        for item in sorted(project.files, key=lambda f: (f.sort_order, f.created_at))
    ]


def serialize_money(project: Project) -> dict:
    """Semua angka uang project. Hanya untuk user dengan permission financial.view."""
    numbers = financial_numbers(project)
    value_after_tax = calc.money(project.value_before_tax * (1 + settings.PORTFOLIO_VAT_RATE))

    summary = ProjectReadWithFinancial(
        id=project.id,
        project_code=project.project_code,
        project_name=project.project_name,
        year=project.year,
        is_featured=project.is_featured,
        value_before_tax=project.value_before_tax,
        carry_over_value=project.carry_over_value,
        cogs=numbers["cogs"],
        operational_cost=numbers["operational_cost"],
        revenue=numbers["revenue"],
        value_after_tax=value_after_tax,
        net_profit=numbers["net_profit"],
    )

    return {
        "value_before_tax": summary.value_before_tax,
        "value_after_tax": summary.value_after_tax,
        "carry_over_value": summary.carry_over_value,
        "financial": {**numbers, "value_after_tax": summary.value_after_tax},
    }


def serialize_project_list_item(
    project: Project,
    today: date,
    *,
    include_financial: bool,
    cover_image_url: str | None = None,
) -> dict:
    """Bentuk ringkas project untuk Portfolio Directory."""
    metrics = calc.project_metrics(
        start_date=project.start_date,
        end_date=project.end_date,
        status_code=project.project_status.project_status_code,
        today=today,
    )

    customer = serialize_customer(project)
    tech_stack = serialize_tech_stack(project)

    data = {
        "id": project.id,
        "project_code": project.project_code,
        "project_name": project.project_name,
        "year": project.year,
        "project_objective": project.project_objective,
        "customer_name": (
            customer["customer_name"]
            if customer is not None
            else None
        ),
        "industry": (
            customer["industry"]
            if customer is not None
            else None
        ),
        "tech_stacks": {
            "frontend": tech_stack["frontend"],
            "backend": tech_stack["backend"],
            "data_storage": tech_stack["data_storage"],
        },
        "project_status": ref(
            project.project_status,
            "project_status",
        ),
        "contract_name": project.contract_name,
        "contract_number": project.contract_number,
        "start_date": project.start_date,
        "end_date": project.end_date,
        "progress_percent": metrics.progress_percent,
        "remaining_days": metrics.remaining_days,
        "is_featured": project.is_featured,
        "cover_image_url": cover_image_url,
        "updated_at": project.updated_at,
    }

    if include_financial:
        data["value_before_tax"] = project.value_before_tax

    return data


def serialize_project(project: Project, today: date, *, include_financial: bool) -> dict:
    """Satu project dengan semua perspektifnya. Angka uang hanya ikut bila include_financial."""
    metrics = calc.project_metrics(
        start_date=project.start_date,
        end_date=project.end_date,
        status_code=project.project_status.project_status_code,
        today=today,
    )

    data = ProjectRead.model_validate(project).model_dump()
    data.update(
        {
            "opportunity": project.opportunity,
            "contract_name": project.contract_name,
            "contract_number": project.contract_number,
            "business_unit": ref(project.business_unit, "business_unit"),
            "project_status": ref(project.project_status, "project_status"),
            "project_manager": project.project_manager,
            "account_manager": project.account_manager,
            "start_date": project.start_date,
            "end_date": project.end_date,
            "total_days": metrics.total_days,
            "remaining_days": metrics.remaining_days,
            "progress_percent": metrics.progress_percent,
            "is_overdue": metrics.is_overdue,
            "project_objective": project.project_objective,
            "project_description": project.project_description,
            "project_background": project.project_background,
            "project_challenges": project.project_challenges,
            "project_solution": project.project_solution,
            "customer": serialize_customer(project),
            "tech_stack": serialize_tech_stack(project),
            "partners": serialize_partners(project),
            "success_metrics": serialize_success_metrics(project),
            "files": serialize_files(project),
            "created_at": project.created_at,
            "updated_at": project.updated_at,
        }
    )

    if include_financial:
        data.update(serialize_money(project))

    return data
