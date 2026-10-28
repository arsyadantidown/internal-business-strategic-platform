"""Schema request/response modul project. ProjectCreate, ProjectRead dan ProjectReadWithFinancial
dipakai bersama oleh modul lain (mis. endpoint baca dan import), jadi nama dan field-nya jangan diubah
tanpa sepengetahuan tim."""

from datetime import date
from decimal import Decimal
from typing import Annotated, Literal
from uuid import UUID

from pydantic import (
    BaseModel,
    BeforeValidator,
    ConfigDict,
    Field,
    StringConstraints,
    model_validator,
)

Money = Annotated[Decimal, Field(ge=0, max_digits=20, decimal_places=2)]
PartnerRole = Literal["principal", "vendor"]


def _strip_to_none(value):
    # Teks opsional yang dikirim kosong ("" atau spasi) disimpan sebagai NULL.
    if isinstance(value, str):
        value = value.strip()
        return value or None
    return value


def _optional(max_length: int | None = None):
    return Annotated[
        Annotated[str, StringConstraints(max_length=max_length)] | None,
        BeforeValidator(_strip_to_none),
    ]


def _required(max_length: int):
    return Annotated[str, StringConstraints(strip_whitespace=True, min_length=1, max_length=max_length)]


def _lower(value):
    return value.strip().lower() if isinstance(value, str) else value


class StrictModel(BaseModel):
    model_config = ConfigDict(extra="forbid")


# ───────────────────────── perspektif ─────────────────────────
class CustomerInput(StrictModel):
    customer_name: _required(255)
    customer_location: _optional(255) = None
    annual_revenue: _optional(100) = Field(
        default=None, description='Teks bebas mengikuti Excel, contoh "115T (FY 2025)"'
    )
    company_size_id: UUID | None = None
    customer_type_id: UUID | None = None
    industry_id: UUID | None = None
    legal_structure_id: UUID | None = None


class FinancialInput(StrictModel):
    """Revenue tidak diinput: sama dengan value_before_tax project."""

    cogs: Money = Decimal("0")
    operational_cost: Money = Decimal("0")


class SuccessMetricInput(StrictModel):
    success_metric_value: _required(50)
    success_metric_label: _required(150)
    sort_order: int = Field(default=0, ge=0, le=32767)


class PartnerInput(StrictModel):
    partner_id: UUID
    partner_role: Annotated[PartnerRole, BeforeValidator(_lower)]
    partner_contribution: _optional(150) = None


# ───────────────────────── project ─────────────────────────
class ProjectCreate(StrictModel):
    project_code: _required(100)
    opportunity: _optional(255) = None
    project_name: _required(255)
    year: int = Field(ge=1900, le=2200)
    contract_name: _optional(255) = None
    contract_number: _optional(150) = None
    business_unit_id: UUID
    project_status_id: UUID
    value_before_tax: Money
    carry_over_value: Money | None = None
    project_manager: _optional(150) = None
    account_manager: _optional(150) = None
    start_date: date
    end_date: date
    project_objective: _optional() = None
    project_description: _optional() = None
    project_background: _optional() = None
    project_challenges: _optional() = None
    project_solution: _optional() = None
    is_featured: bool = False
    customer: CustomerInput
    financial: FinancialInput = Field(default_factory=FinancialInput)
    product_ids: list[UUID] = Field(default_factory=list)
    tech_stack_ids: list[UUID] = Field(default_factory=list)
    partners: list[PartnerInput] = Field(default_factory=list)
    success_metrics: list[SuccessMetricInput] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_date_range(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date harus setelah start_date")
        return self

    @model_validator(mode="after")
    def validate_unique_partners(self):
        keys = [(item.partner_id, item.partner_role) for item in self.partners]
        if len(keys) != len(set(keys)):
            raise ValueError("Partner dengan peran yang sama tidak boleh dobel")
        return self


class ProjectUpdate(StrictModel):
    """PATCH: hanya field yang dikirim yang berubah. Perspektif lain diubah lewat endpoint PUT masing-masing."""

    project_code: _required(100) = None
    opportunity: _optional(255) = None
    project_name: _required(255) = None
    year: int = Field(default=None, ge=1900, le=2200)
    contract_name: _optional(255) = None
    contract_number: _optional(150) = None
    business_unit_id: UUID = None
    project_status_id: UUID = None
    value_before_tax: Money = None
    carry_over_value: Money | None = None
    project_manager: _optional(150) = None
    account_manager: _optional(150) = None
    start_date: date = None
    end_date: date = None
    project_objective: _optional() = None
    project_description: _optional() = None
    project_background: _optional() = None
    project_challenges: _optional() = None
    project_solution: _optional() = None
    is_featured: bool = None


class ProductsRequest(StrictModel):
    product_ids: list[UUID] = Field(default_factory=list)


class TechStacksRequest(StrictModel):
    tech_stack_ids: list[UUID] = Field(default_factory=list)


class PartnersRequest(StrictModel):
    partners: list[PartnerInput] = Field(default_factory=list)

    @model_validator(mode="after")
    def validate_unique_partners(self):
        keys = [(item.partner_id, item.partner_role) for item in self.partners]
        if len(keys) != len(set(keys)):
            raise ValueError("Partner dengan peran yang sama tidak boleh dobel")
        return self


class SuccessMetricsRequest(StrictModel):
    success_metrics: list[SuccessMetricInput] = Field(default_factory=list, max_length=20)


# ───────────────────────── response bersama ─────────────────────────
class ProjectRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    project_code: str
    project_name: str
    year: int
    is_featured: bool


class ProjectReadWithFinancial(ProjectRead):
    """Dipakai hanya untuk user dengan permission financial.view."""

    value_before_tax: Decimal
    carry_over_value: Decimal | None = None
    cogs: Decimal
    operational_cost: Decimal
    revenue: Decimal
    value_after_tax: Decimal
    net_profit: Decimal


# ───────────────────────── file ─────────────────────────
FileCategory = Literal["image", "video", "document", "case_study"]


class ProjectFileUpdate(StrictModel):
    file_title: _optional(255) = None
    file_description: _optional() = None
    sort_order: int = Field(default=None, ge=0, le=32767)
