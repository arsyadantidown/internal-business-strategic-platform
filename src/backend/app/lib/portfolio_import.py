import csv
import re
from datetime import date, datetime
from decimal import Decimal, InvalidOperation
from io import StringIO
from typing import Any


# Kolom yang berasal dari rumus Excel.
# Nilainya tidak di-import karena backend menghitung ulang.
CALCULATED_HEADERS = {
    "No",
    "Project Value (after tax)",
    "Progress Completion",
    "%",
    "Total Days",
    "Remaining Days",
    "Revenue",
    "Net Profit",
}


# Mapping header Excel ke nama field internal backend.
COLUMN_MAP = {
    "Customer": "customer_name",
    "Customer Size": "customer_size",
    "Revenue/Annual Sales/Annual Budget": "annual_revenue",
    "Customer Type": "customer_type",
    "Industry": "industry",
    "Location": "customer_location",
    "Legal Structure": "legal_structure",
    "Opportunity": "opportunity",
    "Project Name": "project_name",
    "Year": "year",
    "Contract/PO Name": "contract_name",
    "Contract/PO Number": "contract_number",
    "Business Unit": "business_unit",
    "Project ID": "project_code",
    "Project Value (before tax)": "value_before_tax",
    "Carry Over Value": "carry_over_value",
    "Project Status": "project_status",
    "Project Manager": "project_manager",
    "Account Manager": "account_manager",
    "Start Date": "start_date",
    "End Date": "end_date",
    "Project Objective": "project_objective",
    "COGS": "cogs",
    "Operational Costs": "operational_cost",
    "Product Use": "products",
    "Frontend": "frontend",
    "Backend": "backend",
    "Data & Storage": "data_storage",
    "Partner": "partners",
}


# Required fields untuk validasi preview awal.
# Validasi ke master data/database akan ditambahkan kemudian.
REQUIRED_FIELDS = {
    "customer_name",
    "project_name",
    "year",
    "business_unit",
    "project_code",
    "value_before_tax",
    "project_status",
    "start_date",
    "end_date",
}


def normalize_text(value: Any) -> str | None:
    """
    Merapikan nilai teks dari Excel.

    - Menghapus spasi berlebih.
    - Mengubah newline menjadi spasi.
    - Mengembalikan None jika kosong.
    """
    if value is None:
        return None

    text = str(value).strip()

    if not text:
        return None

    return " ".join(text.split())


def extract_customer_size_code(value: Any) -> str | None:
    """
    Mengambil kode Tier dari Customer Size.

    Contoh:
    Tier 1 : Strategic/Enterprise (>1T)

    menjadi:
    TIER_1
    """
    text = normalize_text(value)

    if text is None:
        return None

    match = re.search(
        r"\bTier\s*(\d+)\b",
        text,
        flags=re.IGNORECASE,
    )

    if not match:
        return None

    return f"TIER_{match.group(1)}"


def split_multi_value(value: Any) -> list[str]:
    """
    Memisahkan cell multi-value berdasarkan koma.

    Tanda kutip digunakan untuk melindungi koma yang merupakan
    bagian dari nama item.

    Contoh:
    '"Vue.js (Vue, Vue2, Vue3)", Nuxt 3 (JavaScript)'

    menjadi:
    [
        "Vue.js (Vue, Vue2, Vue3)",
        "Nuxt 3 (JavaScript)",
    ]
    """
    text = normalize_text(value)

    if text is None:
        return []

    reader = csv.reader(
        StringIO(text),
        skipinitialspace=True,
    )

    values = next(reader, [])

    return [
        normalized
        for item in values
        if (normalized := normalize_text(item)) is not None
    ]


def parse_partner_cell(value: Any) -> list[dict[str, str]]:
    """
    Membaca cell Partner.

    Contoh:
    Principal: Zabbix SIA,
    Vendor: PT Bangunindo Teknusa

    menjadi:
    [
        {
            "partner_role": "principal",
            "partner_name": "Zabbix SIA",
        },
        {
            "partner_role": "vendor",
            "partner_name": "PT Bangunindo Teknusa",
        },
    ]
    """
    if value is None:
        return []

    text = str(value).strip()

    if not text:
        return []

    pattern = re.compile(
        r"(?:^|[,\n])\s*(principal|vendor)\s*:\s*",
        flags=re.IGNORECASE,
    )

    matches = list(pattern.finditer(text))

    if not matches:
        return []

    result = []

    for index, match in enumerate(matches):
        start = match.end()

        if index + 1 < len(matches):
            end = matches[index + 1].start()
        else:
            end = len(text)

        partner_name = normalize_text(
            text[start:end].strip(" ,\n\r\t")
        )

        if partner_name is None:
            continue

        result.append(
            {
                "partner_role": match.group(1).lower(),
                "partner_name": partner_name,
            }
        )

    return result


def normalize_excel_date(value: Any):
    """
    Mengubah datetime hasil pembacaan Excel menjadi date.
    """
    if isinstance(value, datetime):
        return value.date()

    return value


def normalize_year(value: Any):
    """
    Excel dapat membaca tahun sebagai float,
    misalnya 2026.0.

    Fungsi ini mengubahnya menjadi integer 2026.
    """
    if isinstance(value, float) and value.is_integer():
        return int(value)

    return value


def normalize_decimal(value: Any) -> Decimal | None:
    """
    Mengubah nilai financial menjadi Decimal.

    Cell kosong akan dikembalikan sebagai None.
    """
    if value is None:
        return None

    if isinstance(value, str) and not value.strip():
        return None

    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError):
        return None


def parse_portfolio_row(
    headers: list[Any],
    row: list[Any],
    row_number: int,
) -> dict:
    """
    Mengubah satu baris Excel menjadi struktur data internal
    untuk proses import preview.

    Kolom hasil perhitungan Excel diabaikan.
    """
    data: dict[str, Any] = {}

    for header, value in zip(headers, row):
        normalized_header = normalize_text(header)

        if normalized_header is None:
            continue

        # Jangan ambil kolom formula Excel.
        if normalized_header in CALCULATED_HEADERS:
            continue

        field_name = COLUMN_MAP.get(normalized_header)

        # Header yang tidak dikenal sementara diabaikan.
        if field_name is None:
            continue

        data[field_name] = value

    text_fields = {
        "customer_name",
        "annual_revenue",
        "customer_type",
        "industry",
        "customer_location",
        "legal_structure",
        "opportunity",
        "project_name",
        "contract_name",
        "contract_number",
        "business_unit",
        "project_code",
        "project_status",
        "project_manager",
        "account_manager",
        "project_objective",
    }

    for field in text_fields:
        if field in data:
            data[field] = normalize_text(data[field])

    data["customer_size_code"] = extract_customer_size_code(
        data.pop("customer_size", None)
    )

    data["year"] = normalize_year(
        data.get("year")
    )

    data["start_date"] = normalize_excel_date(
        data.get("start_date")
    )

    data["end_date"] = normalize_excel_date(
        data.get("end_date")
    )

    data["value_before_tax"] = normalize_decimal(
        data.get("value_before_tax")
    )

    data["carry_over_value"] = normalize_decimal(
        data.get("carry_over_value")
    )

    data["cogs"] = normalize_decimal(
        data.get("cogs")
    )

    data["operational_cost"] = normalize_decimal(
        data.get("operational_cost")
    )

    data["products"] = split_multi_value(
        data.get("products")
    )

    data["frontend"] = split_multi_value(
        data.get("frontend")
    )

    data["backend"] = split_multi_value(
        data.get("backend")
    )

    data["data_storage"] = split_multi_value(
        data.get("data_storage")
    )

    data["partners"] = parse_partner_cell(
        data.get("partners")
    )

    # Menyimpan nomor baris Excel asli agar error preview
    # dapat menunjuk baris yang bermasalah.
    data["source_row"] = row_number

    return data


def validate_portfolio_row(data: dict) -> list[dict[str, str]]:
    """
    Melakukan validasi dasar satu baris hasil parsing Excel.

    Validasi ini belum melakukan query ke database.
    """
    errors: list[dict[str, str]] = []

    # Required field validation.
    for field in REQUIRED_FIELDS:
        value = data.get(field)

        if value is None or value == "":
            errors.append(
                {
                    "field": field,
                    "code": "REQUIRED_FIELD",
                    "message": f"{field} wajib diisi",
                }
            )

    # Year harus integer.
    year = data.get("year")

    if year is not None and not isinstance(year, int):
        errors.append(
            {
                "field": "year",
                "code": "INVALID_YEAR",
                "message": "year harus berupa angka tahun",
            }
        )

    # Nilai project tidak boleh negatif.
    value_before_tax = data.get("value_before_tax")

    if (
        value_before_tax is not None
        and value_before_tax < Decimal("0")
    ):
        errors.append(
            {
                "field": "value_before_tax",
                "code": "INVALID_VALUE",
                "message": "value_before_tax tidak boleh negatif",
            }
        )

    start_date = data.get("start_date")
    end_date = data.get("end_date")

    # Validasi tipe tanggal.
    if start_date is not None and not isinstance(start_date, date):
        errors.append(
            {
                "field": "start_date",
                "code": "INVALID_DATE",
                "message": "start_date tidak valid",
            }
        )

    if end_date is not None and not isinstance(end_date, date):
        errors.append(
            {
                "field": "end_date",
                "code": "INVALID_DATE",
                "message": "end_date tidak valid",
            }
        )

    # End date harus setelah start date.
    if (
        isinstance(start_date, date)
        and isinstance(end_date, date)
        and end_date <= start_date
    ):
        errors.append(
            {
                "field": "end_date",
                "code": "INVALID_DATE_RANGE",
                "message": "end_date harus setelah start_date",
            }
        )

    return errors


def validate_import_rows(
    rows: list[dict],
) -> dict:
    """
    Memvalidasi seluruh baris hasil parsing Excel.

    Project ID yang muncul lebih dari sekali dalam file
    ditandai error tanpa membedakan huruf besar/kecil.
    """
    project_code_rows: dict[str, list[int]] = {}

    # Cari seluruh kemunculan Project ID.
    for index, row in enumerate(rows):
        project_code = normalize_text(
            row.get("project_code")
        )

        if project_code is None:
            continue

        key = project_code.casefold()

        project_code_rows.setdefault(
            key,
            [],
        ).append(index)

    # Kumpulkan index row yang duplicate.
    duplicate_indexes: set[int] = set()

    for indexes in project_code_rows.values():
        if len(indexes) > 1:
            duplicate_indexes.update(indexes)

    preview_rows = []

    valid_rows = 0
    invalid_rows = 0

    # Validasi setiap row.
    for index, row in enumerate(rows):
        errors = validate_portfolio_row(row)

        warnings: list[dict[str, str]] = []

        # Duplicate Project ID di file.
        if index in duplicate_indexes:
            errors.append(
                {
                    "field": "project_code",
                    "code": "DUPLICATE_PROJECT_CODE",
                    "message": (
                        "Project ID muncul lebih dari sekali "
                        "di file"
                    ),
                }
            )

        is_valid = len(errors) == 0

        if is_valid:
            valid_rows += 1
        else:
            invalid_rows += 1

        preview_rows.append(
            {
                "row": row.get("source_row"),
                "valid": is_valid,
                "data": row,
                "errors": errors,
                "warnings": warnings,
            }
        )

    return {
        "total_rows": len(rows),
        "valid_rows": valid_rows,
        "invalid_rows": invalid_rows,
        "rows": preview_rows,
    }