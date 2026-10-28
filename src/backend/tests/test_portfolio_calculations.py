from datetime import date
from decimal import Decimal

import pytest

from app.lib.portfolio_calculations import (
    calculate_project_financials,
    calculate_project_timeline,
)


def test_project_before_start():
    result = calculate_project_timeline(
        start_date=date(2026, 10, 10),
        end_date=date(2026, 10, 20),
        today=date(2026, 10, 5),
    )

    assert result["total_days"] == 10
    assert result["elapsed_days"] == 0
    assert result["remaining_days"] == 10
    assert result["progress_percent"] == 0


def test_project_in_progress():
    result = calculate_project_timeline(
        start_date=date(2026, 10, 1),
        end_date=date(2026, 10, 31),
        today=date(2026, 10, 16),
    )

    assert result["total_days"] == 30
    assert result["elapsed_days"] == 15
    assert result["remaining_days"] == 15
    assert result["progress_percent"] == 50


def test_project_after_end():
    result = calculate_project_timeline(
        start_date=date(2026, 10, 1),
        end_date=date(2026, 10, 31),
        today=date(2026, 11, 5),
    )

    assert result["total_days"] == 30
    assert result["elapsed_days"] == 30
    assert result["remaining_days"] == 0
    assert result["progress_percent"] == 100


def test_project_financials():
    result = calculate_project_financials(
        value_before_tax=Decimal("100000000"),
        cogs=Decimal("50000000"),
        operational_cost=Decimal("20000000"),
    )

    assert result["value_after_tax"] == Decimal("111000000.00")
    assert result["revenue"] == Decimal("100000000")
    assert result["net_profit"] == Decimal("30000000")


def test_invalid_project_date():
    with pytest.raises(
        ValueError,
        match="end_date harus setelah start_date",
    ):
        calculate_project_timeline(
            start_date=date(2026, 10, 20),
            end_date=date(2026, 10, 10),
            today=date(2026, 10, 15),
        )


def test_negative_net_profit():
    result = calculate_project_financials(
        value_before_tax=Decimal("100000000"),
        cogs=Decimal("90000000"),
        operational_cost=Decimal("20000000"),
    )

    assert result["value_after_tax"] == Decimal("111000000.00")
    assert result["revenue"] == Decimal("100000000")
    assert result["net_profit"] == Decimal("-10000000")