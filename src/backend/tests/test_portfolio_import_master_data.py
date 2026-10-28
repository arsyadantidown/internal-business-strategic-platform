from datetime import date
from decimal import Decimal

import pytest

from app.connections.session import AsyncSessionLocal, engine
from app.lib.portfolio_import_master_data import match_master_data


def make_preview():
    return {
        "total_rows": 1,
        "valid_rows": 1,
        "invalid_rows": 0,
        "rows": [
            {
                "row": 3,
                "valid": True,
                "data": {
                    "source_row": 3,
                    "customer_name": (
                        "PT Bank Mandiri (Persero) Tbk"
                    ),
                    "customer_size_code": "TIER_1",
                    "customer_type": "Strategic Customer",
                    "industry": "Financial Services",
                    "legal_structure": (
                        "State-owned Enterprise"
                    ),
                    "business_unit": "ITMS",
                    "project_status": "On Going",
                    "project_name": (
                        "Bank Mandiri SIEM & Monitoring"
                    ),
                    "project_code": (
                        "ITMS_MON_BMRI_2026_PRO"
                    ),
                    "year": 2026,
                    "value_before_tax": Decimal(
                        "3500000000"
                    ),
                    "start_date": date(2026, 9, 1),
                    "end_date": date(2027, 8, 31),
                    "products": [
                        "Bliv Package",
                        "Bliv Dashboard",
                        "Bliv Pipeline",
                    ],
                    "frontend": [
                        "Vue.js (Vue, Vue2, Vue3)",
                        "Nuxt 3 (JavaScript)",
                    ],
                    "backend": [
                        "Python (Flask API, FastAPI)",
                        "PHP (CI3, CI4)",
                    ],
                    "data_storage": [
                        "PostgreSQL (Postgres)",
                        "Hadoop",
                    ],
                },
                "errors": [],
                "warnings": [],
            }
        ],
    }


@pytest.mark.asyncio
async def test_match_master_data_success():
    preview = make_preview()

    try:
        async with AsyncSessionLocal() as db:
            result = await match_master_data(
                db,
                preview,
            )

        assert result["total_rows"] == 1
        assert result["valid_rows"] == 1
        assert result["invalid_rows"] == 0

        row = result["rows"][0]

        assert row["valid"] is True
        assert row["errors"] == []

        data = row["data"]

        assert data["company_size_id"] is not None
        assert data["customer_type_id"] is not None
        assert data["industry_id"] is not None
        assert data["legal_structure_id"] is not None
        assert data["business_unit_id"] is not None
        assert data["project_status_id"] is not None

        assert len(data["product_ids"]) == 3
        assert len(data["tech_stack_ids"]) == 6

    finally:
        await engine.dispose()


@pytest.mark.asyncio
async def test_match_master_data_not_found():
    preview = make_preview()

    preview["rows"][0]["data"]["industry"] = (
        "INDUSTRY_YANG_TIDAK_ADA"
    )

    try:
        async with AsyncSessionLocal() as db:
            result = await match_master_data(
                db,
                preview,
            )

        assert result["valid_rows"] == 0
        assert result["invalid_rows"] == 1

        row = result["rows"][0]

        assert row["valid"] is False

        assert any(
            error["field"] == "industry"
            and error["code"] == "MASTER_DATA_NOT_FOUND"
            for error in row["errors"]
        )

    finally:
        await engine.dispose()