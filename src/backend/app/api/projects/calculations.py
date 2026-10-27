"""Nilai turunan portofolio. Di Excel ini formula, di sini dihitung saat dibaca (tidak disimpan)
supaya tidak pernah tidak sinkron dengan data dasarnya. Fungsi murni, mudah diuji."""

from dataclasses import dataclass
from datetime import date, datetime, timedelta, timezone
from decimal import ROUND_HALF_UP, Decimal

# Kode status project aktif di master project_statuses (lihat seed_portfolio_master.sql).
ACTIVE_PROJECT_STATUS_CODE = "ON_GOING"

# Hari "hari ini" mengikuti WIB (UTC+7, tanpa DST), bukan tanggal UTC server.
# Offset tetap dipakai agar tidak bergantung pada paket tzdata di image Docker.
WIB = timezone(timedelta(hours=7), "WIB")

_CENT = Decimal("0.01")


def today_wib() -> date:
    return datetime.now(WIB).date()


def money(value: Decimal) -> Decimal:
    return value.quantize(_CENT, rounding=ROUND_HALF_UP)


@dataclass(frozen=True)
class ProjectMetrics:
    total_days: int
    elapsed_days: int
    remaining_days: int
    progress_percent: float
    is_overdue: bool


def project_metrics(
    *,
    start_date: date,
    end_date: date,
    status_code: str,
    today: date,
) -> ProjectMetrics:
    """Rumus Excel:
    total days     = end - start
    remaining days = end - today (tidak pernah di bawah 0)
    progress       = 1 - remaining / total  = (today - start) / total, dibatasi 0..100%
    """
    total_days = (end_date - start_date).days

    if total_days > 0:
        elapsed_days = min(
            max((today - start_date).days, 0),
            total_days,
        )
        remaining_days = total_days - elapsed_days
        progress = elapsed_days / total_days
    else:  # data lama dengan satu hari
        elapsed_days = 0
        remaining_days = 0
        progress = 1.0 if today >= end_date else 0.0

    return ProjectMetrics(
        total_days=total_days,
        elapsed_days=elapsed_days,
        remaining_days=remaining_days,
        progress_percent=round(progress * 100, 1),
        # Hanya project yang masih berjalan bisa terlambat.
        is_overdue=status_code == ACTIVE_PROJECT_STATUS_CODE and today > end_date,
    )


def net_profit(revenue: Decimal, cogs: Decimal, operational_costs: Decimal) -> Decimal:
    return revenue - cogs - operational_costs


def net_margin_percent(revenue: Decimal, profit: Decimal) -> float | None:
    if not revenue:
        return None
    return round(float(profit / revenue) * 100, 1)
