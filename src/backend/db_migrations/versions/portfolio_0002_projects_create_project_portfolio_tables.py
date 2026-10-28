"""create project portfolio tables: projects, customers, financials, products, tech stacks, partners,
success metrics and files

Revision ID: portfolio_0002_projects
Revises: portfolio_0001_master
Create Date: 2026-10-27 12:30:00.000000

Satu portofolio = satu baris di projects; perspektif lain menempel lewat project_id.
Soft delete (projects.deleted_at), semua FK RESTRICT. project_code unik tanpa beda huruf
hanya untuk project yang belum dihapus. Acuan: Portfolio_Tabel_Relasi_API_Workflow_v3.
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision: str = "portfolio_0002_projects"
down_revision: Union[str, None] = "portfolio_0001_master"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_code", sa.String(100), nullable=False),
        sa.Column("opportunity", sa.String(255)),
        sa.Column("project_name", sa.String(255), nullable=False),
        sa.Column("year", sa.SmallInteger(), nullable=False),
        sa.Column("contract_name", sa.String(255)),
        sa.Column("contract_number", sa.String(150)),
        sa.Column("business_unit_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("business_units.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("project_status_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("project_statuses.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("value_before_tax", sa.Numeric(20, 2), nullable=False),
        sa.Column("carry_over_value", sa.Numeric(20, 2)),
        sa.Column("project_manager", sa.String(150)),
        sa.Column("account_manager", sa.String(150)),
        sa.Column("start_date", sa.Date(), nullable=False),
        sa.Column("end_date", sa.Date(), nullable=False),
        sa.Column("project_objective", sa.Text()),
        sa.Column("project_description", sa.Text()),
        sa.Column("project_background", sa.Text()),
        sa.Column("project_challenges", sa.Text()),
        sa.Column("project_solution", sa.Text()),
        sa.Column("is_featured", sa.Boolean(), nullable=False, server_default=sa.text("false")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT")),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT")),
        sa.Column("deleted_at", sa.DateTime(timezone=True)),
        sa.CheckConstraint("value_before_tax >= 0", name="ck_projects_value_before_tax_nonnegative"),
        sa.CheckConstraint("end_date > start_date", name="ck_projects_end_after_start"),
    )
    op.execute("CREATE UNIQUE INDEX uq_projects_project_code_live_lower ON projects (lower(project_code)) WHERE deleted_at IS NULL")

    op.create_table(
        "customers",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("customer_name", sa.String(255), nullable=False),
        sa.Column("customer_location", sa.String(255)),
        sa.Column("annual_revenue", sa.String(100)),
        sa.Column("company_size_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("company_sizes.id", ondelete="RESTRICT")),
        sa.Column("customer_type_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("customer_types.id", ondelete="RESTRICT")),
        sa.Column("industry_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("industries.id", ondelete="RESTRICT")),
        sa.Column("legal_structure_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("legal_structures.id", ondelete="RESTRICT")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT")),
        sa.UniqueConstraint("project_id", name="uq_customers_project_id"),
    )

    op.create_table(
        "project_financials",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("cogs", sa.Numeric(20, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("operational_cost", sa.Numeric(20, 2), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT")),
        sa.Column("updated_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT")),
        sa.UniqueConstraint("project_id", name="uq_project_financials_project_id"),
    )

    op.create_table(
        "project_products",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="RESTRICT"), primary_key=True),
        sa.Column("product_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("products.id", ondelete="RESTRICT"), primary_key=True),
    )
    op.create_table(
        "project_tech_stacks",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="RESTRICT"), primary_key=True),
        sa.Column("tech_stack_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("tech_stacks.id", ondelete="RESTRICT"), primary_key=True),
    )
    op.create_table(
        "project_partners",
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="RESTRICT"), primary_key=True),
        sa.Column("partner_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("partners.id", ondelete="RESTRICT"), primary_key=True),
        sa.Column("partner_role", sa.String(20), primary_key=True),
        sa.Column("partner_contribution", sa.String(150)),
        sa.CheckConstraint("partner_role IN ('principal', 'vendor')", name="ck_project_partners_role"),
    )
    op.create_table(
        "project_success_metrics",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("success_metric_value", sa.String(50), nullable=False),
        sa.Column("success_metric_label", sa.String(150), nullable=False),
        sa.Column("sort_order", sa.SmallInteger(), nullable=False, server_default=sa.text("0")),
    )
    op.create_index("ix_project_success_metrics_project_id", "project_success_metrics", ["project_id"])

    op.create_table(
        "project_files",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("project_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("projects.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("file_category", sa.String(20), nullable=False),
        sa.Column("file_name", sa.String(255), nullable=False),
        sa.Column("file_title", sa.String(255)),
        sa.Column("file_description", sa.Text()),
        sa.Column("mime_type", sa.String(100), nullable=False),
        sa.Column("file_size_bytes", sa.BigInteger(), nullable=False),
        sa.Column("storage_key", sa.String(500), nullable=False, unique=True),
        sa.Column("sort_order", sa.SmallInteger(), nullable=False, server_default=sa.text("0")),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("created_by", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id", ondelete="RESTRICT")),
        sa.CheckConstraint("file_category IN ('image', 'video', 'document', 'case_study')", name="ck_project_files_category"),
    )
    op.create_index("ix_project_files_project_id", "project_files", ["project_id"])
    op.execute("CREATE UNIQUE INDEX uq_project_files_case_study_per_project ON project_files (project_id) WHERE file_category = 'case_study'")


def downgrade() -> None:
    op.drop_index("uq_project_files_case_study_per_project", table_name="project_files")
    op.drop_index("ix_project_files_project_id", table_name="project_files")
    op.drop_table("project_files")
    op.drop_index("ix_project_success_metrics_project_id", table_name="project_success_metrics")
    op.drop_table("project_success_metrics")
    op.drop_table("project_partners")
    op.drop_table("project_tech_stacks")
    op.drop_table("project_products")
    op.drop_table("project_financials")
    op.drop_table("customers")
    op.drop_index("uq_projects_project_code_live_lower", table_name="projects")
    op.drop_table("projects")
