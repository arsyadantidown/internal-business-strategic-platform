from datetime import date, datetime
from decimal import Decimal
from zoneinfo import ZoneInfo


JAKARTA_TZ = ZoneInfo("Asia/Jakarta")
TAX_RATE = Decimal("0.11")


def get_jakarta_today() -> date:
    """Mengambil tanggal hari ini berdasarkan timezone Asia/Jakarta."""
    return datetime.now(JAKARTA_TZ).date()


def calculate_project_timeline(
    start_date: date,
    end_date: date,
    today: date | None = None,
) -> dict:
    """
    Menghitung total hari, hari berjalan, sisa hari,
    dan persentase progress berdasarkan tanggal.
    """
    if today is None:
        today = get_jakarta_today()

    total_days = (end_date - start_date).days

    elapsed_days = (today - start_date).days
    elapsed_days = max(0, min(elapsed_days, total_days))

    remaining_days = total_days - elapsed_days

    progress_percent = (
        (elapsed_days / total_days) * 100
        if total_days > 0
        else 100.0
    )

    return {
        "total_days": total_days,
        "elapsed_days": elapsed_days,
        "remaining_days": remaining_days,
        "progress_percent": progress_percent,
    }


def calculate_project_financials(
    value_before_tax: Decimal,
    cogs: Decimal,
    operational_cost: Decimal,
) -> dict:
    """
    Menghitung nilai setelah pajak, revenue, dan net profit.
    """
    value_after_tax = value_before_tax * (Decimal("1") + TAX_RATE)
    revenue = value_before_tax
    net_profit = revenue - cogs - operational_cost

    return {
        "value_after_tax": value_after_tax,
        "revenue": revenue,
        "net_profit": net_profit,
    }