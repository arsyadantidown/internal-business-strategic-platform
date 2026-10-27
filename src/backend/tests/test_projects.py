from datetime import date, timedelta
from decimal import Decimal

import pytest
from sqlalchemy import func, select

from app.api.projects import calculations as calc
from app.api.projects.schema import ProjectCreate
from app.api.projects.usecase import create_project
from app.models.customer_model import Customer
from app.models.project_model import Project

URL = "/api/v1/projects"


def project_payload(refs, *, code="ITMS_MON_BMRI_2026_PRO", customer_name="PT Bank Mandiri", **override):
    today = date.today()
    body = {
        "project_code": code,
        "project_name": f"Project {code}",
        "year": 2026,
        "business_unit_id": refs["business_unit"]["ITMS"],
        "project_status_id": refs["status"]["ON_GOING"],
        "value_before_tax": "1000000",
        "project_manager": "Budi",
        "account_manager": "Sari",
        "start_date": (today - timedelta(days=100)).isoformat(),
        "end_date": (today + timedelta(days=100)).isoformat(),
        "customer": {
            "customer_name": customer_name,
            "customer_location": "Jakarta",
            "annual_revenue": "115T (FY 2025)",
            "company_size_id": refs["company_size"]["TIER_1"],
            "customer_type_id": refs["customer_type"]["STRATEGIC_CUSTOMER"],
            "industry_id": refs["industry"]["GOVERNMENT"],
            "legal_structure_id": refs["legal_structure"]["STATE_OWNED_ENTERPRISE"],
        },
        "financial": {"cogs": "200000", "operational_cost": "100000"},
        "product_ids": refs["products"][:1],
        "tech_stack_ids": [refs["tech"]["frontend"][0], refs["tech"]["backend"][0]],
        "partners": [
            {"partner_id": refs["partners"]["alpha"], "partner_role": "principal"},
            {"partner_id": refs["partners"]["beta"], "partner_role": "vendor", "partner_contribution": "Implementasi"},
        ],
        "success_metrics": [
            {"success_metric_value": "+60%", "success_metric_label": "Digital users", "sort_order": 1},
        ],
    }
    body.update(override)
    return body


async def create(client, headers, body):
    return await client.post(URL, json=body, headers=headers)


# ───────────────────────── perhitungan (fungsi murni) ─────────────────────────
def test_metrics_follow_excel_formulas():
    metrics = calc.project_metrics(
        start_date=date(2026, 1, 1), end_date=date(2026, 1, 11), status_code="ON_GOING", today=date(2026, 1, 6)
    )
    assert (metrics.total_days, metrics.remaining_days, metrics.progress_percent) == (10, 5, 50.0)
    assert metrics.is_overdue is False


def test_metrics_overdue_only_for_active_and_clamped():
    kwargs = dict(start_date=date(2026, 1, 1), end_date=date(2026, 1, 11), today=date(2026, 3, 1))
    active = calc.project_metrics(status_code="ON_GOING", **kwargs)
    assert active.remaining_days == 0 and active.progress_percent == 100.0 and active.is_overdue
    assert calc.project_metrics(status_code="CLOSED", **kwargs).is_overdue is False


def test_net_profit_and_margin():
    assert calc.net_profit(Decimal("100"), Decimal("30"), Decimal("20")) == Decimal("50")
    assert calc.net_margin_percent(Decimal("0"), Decimal("0")) is None


# ───────────────────────── batas permission ─────────────────────────
async def test_requires_authentication(client, refs):
    assert (await client.post(URL, json=project_payload(refs))).status_code in (401, 403)


async def test_user_without_role_is_forbidden(client, no_role, refs):
    assert (await create(client, no_role, project_payload(refs))).status_code == 403


async def test_view_only_user_cannot_write(client, admin, commercial, refs):
    created = await create(client, admin, project_payload(refs))
    assert created.status_code == 201, created.text
    pid = created.json()["data"]["id"]

    assert (await create(client, commercial, project_payload(refs, code="X1"))).status_code == 403
    assert (await client.patch(f"{URL}/{pid}", json={"project_name": "x"}, headers=commercial)).status_code == 403
    assert (await client.delete(f"{URL}/{pid}", headers=commercial)).status_code == 403
    for part, body in {
        "customer": project_payload(refs)["customer"],
        "financial": {},
        "products": {"product_ids": []},
        "tech-stacks": {"tech_stack_ids": []},
        "partners": {"partners": []},
        "success-metrics": {"success_metrics": []},
    }.items():
        assert (await client.put(f"{URL}/{pid}/{part}", json=body, headers=commercial)).status_code == 403, part
    files = {"file": ("a.png", PNG, "image/png")}
    assert (
        await client.post(f"{URL}/{pid}/files", files=files, data={"file_category": "image"}, headers=commercial)
    ).status_code == 403


# ───────────────────────── financial.view ─────────────────────────
MONEY_KEYS = {"value_before_tax", "value_after_tax", "carry_over_value", "financial"}


async def test_money_fields_hidden_without_financial_view(client, engineer, refs):
    response = await create(client, engineer, project_payload(refs))
    assert response.status_code == 201, response.text
    data = response.json()["data"]
    assert not (MONEY_KEYS & set(data))
    assert "1000000" not in response.text and "700000" not in response.text
    assert data["project_code"] == "ITMS_MON_BMRI_2026_PRO"  # bagian non-uang tetap tampil


async def test_money_fields_shown_with_financial_view(client, admin, refs):
    data = (await create(client, admin, project_payload(refs))).json()["data"]
    assert Decimal(str(data["value_before_tax"])) == Decimal("1000000")
    assert Decimal(str(data["value_after_tax"])) == Decimal("1110000.00")
    financial = data["financial"]
    assert Decimal(str(financial["revenue"])) == Decimal("1000000")  # revenue = value_before_tax
    assert Decimal(str(financial["net_profit"])) == Decimal("700000")
    assert financial["net_margin_percent"] == 70.0


# ───────────────────────── create ─────────────────────────
async def test_create_returns_all_perspectives(client, admin, refs):
    data = (await create(client, admin, project_payload(refs))).json()["data"]

    assert data["customer"]["customer_name"] == "PT Bank Mandiri"
    assert data["customer"]["industry"]["code"] == "GOVERNMENT"
    assert data["total_days"] == 200 and data["remaining_days"] == 100 and data["progress_percent"] == 50.0
    assert len(data["tech_stack"]["products"]) == 1
    assert len(data["tech_stack"]["frontend"]) == 1 and len(data["tech_stack"]["backend"]) == 1
    assert [(p["partner_role"], p["partner_contribution"]) for p in data["partners"]] == [
        ("principal", None),
        ("vendor", "Implementasi"),
    ]
    assert data["success_metrics"][0]["success_metric_value"] == "+60%"
    assert data["files"] == [] and data["is_featured"] is False


async def test_each_project_has_its_own_customer_row(client, admin, refs, db):
    await create(client, admin, project_payload(refs, code="P1"))
    await create(client, admin, project_payload(refs, code="P2"))
    assert (await db.execute(select(func.count(Customer.id)))).scalar_one() == 2


async def test_duplicate_code_is_conflict_case_insensitive(client, admin, refs):
    assert (await create(client, admin, project_payload(refs, code="DUP_1"))).status_code == 201
    assert (await create(client, admin, project_payload(refs, code="dup_1"))).status_code == 409


async def test_invalid_reference_creates_nothing(client, admin, refs, db):
    body = project_payload(refs, code="REF_1")
    body["business_unit_id"] = "00000000-0000-0000-0000-000000000000"
    body["customer"]["industry_id"] = "00000000-0000-0000-0000-000000000001"
    response = await create(client, admin, body)
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_REFERENCE"
    fields = {item["field"] for item in response.json()["error"]["details"]}
    assert (await db.execute(select(func.count(Project.id)))).scalar_one() == 0
    assert fields == {"business_unit_id", "customer.industry_id"}


@pytest.mark.parametrize("delta", [0, -5])
async def test_end_date_must_be_after_start(client, admin, refs, delta):
    body = project_payload(refs, code="D1")
    body["end_date"] = (date.fromisoformat(body["start_date"]) + timedelta(days=delta)).isoformat()
    assert (await create(client, admin, body)).status_code == 422


async def test_validation_errors(client, admin, refs):
    assert (await create(client, admin, project_payload(refs, code="V1", value_before_tax="-5"))).status_code == 422
    assert (await create(client, admin, project_payload(refs, code="  "))).status_code == 422
    assert (await create(client, admin, project_payload(refs, code="V2", year=1800))).status_code == 422
    body = project_payload(refs, code="V3")
    body["partners"][0]["partner_role"] = "reseller"
    assert (await create(client, admin, body)).status_code == 422
    body = project_payload(refs, code="V4")
    body["unknown_field"] = 1
    assert (await create(client, admin, body)).status_code == 422


# ───────────────────────── create_project() bisa dipakai import ─────────────────────────
async def test_create_project_function_does_not_commit(db, refs):
    payload = ProjectCreate.model_validate(project_payload(refs, code="IMPORT_1"))
    project = await create_project(db, payload, created_by=None)
    assert project.id is not None
    await db.rollback()  # pemanggil (import) boleh membatalkan
    assert (await db.execute(select(func.count(Project.id)))).scalar_one() == 0

    await create_project(db, payload, created_by=None)
    await db.commit()
    assert (await db.execute(select(func.count(Project.id)))).scalar_one() == 1


# ───────────────────────── PATCH ─────────────────────────
async def test_patch_partial_update(client, admin, refs):
    pid = (await create(client, admin, project_payload(refs))).json()["data"]["id"]
    response = await client.patch(
        f"{URL}/{pid}",
        json={"project_manager": "Andi", "opportunity": None, "is_featured": True, "value_before_tax": "2000000"},
        headers=admin,
    )
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["project_manager"] == "Andi" and data["account_manager"] == "Sari"
    assert data["is_featured"] is True and Decimal(str(data["value_before_tax"])) == Decimal("2000000")
    # perspektif lain tidak tersentuh oleh PATCH
    assert data["customer"]["customer_name"] == "PT Bank Mandiri" and len(data["partners"]) == 2


async def test_patch_rejections(client, admin, refs):
    pid = (await create(client, admin, project_payload(refs, code="PA_1"))).json()["data"]["id"]
    other = (await create(client, admin, project_payload(refs, code="PA_2"))).json()["data"]["id"]

    assert (await client.patch(f"{URL}/{pid}", json={}, headers=admin)).status_code == 400
    assert (await client.patch(f"{URL}/{pid}", json={"project_name": None}, headers=admin)).status_code == 422
    assert (await client.patch(f"{URL}/{pid}", json={"end_date": "2000-01-01"}, headers=admin)).status_code == 422
    assert (await client.patch(f"{URL}/{other}", json={"project_code": "pa_1"}, headers=admin)).status_code == 409
    assert (await client.patch(f"{URL}/{pid}", json={"project_code": "PA_1"}, headers=admin)).status_code == 200
    missing = "00000000-0000-0000-0000-000000000000"
    assert (await client.patch(f"{URL}/{missing}", json={"project_name": "x"}, headers=admin)).status_code == 404


# ───────────────────────── soft delete ─────────────────────────
async def test_soft_delete(client, admin, refs, db):
    pid = (await create(client, admin, project_payload(refs, code="SD_1"))).json()["data"]["id"]
    assert (await client.delete(f"{URL}/{pid}", headers=admin)).status_code == 200

    row = (await db.execute(select(Project).where(Project.id == pid))).scalar_one()
    assert row.deleted_at is not None  # baris tetap ada

    assert (await client.delete(f"{URL}/{pid}", headers=admin)).status_code == 404
    assert (await client.patch(f"{URL}/{pid}", json={"project_name": "x"}, headers=admin)).status_code == 404
    assert (await client.put(f"{URL}/{pid}/products", json={"product_ids": []}, headers=admin)).status_code == 404

    # kode project yang sudah dihapus boleh dipakai lagi, tapi tidak boleh ada dua yang aktif
    assert (await create(client, admin, project_payload(refs, code="sd_1"))).status_code == 201
    assert (await create(client, admin, project_payload(refs, code="SD_1"))).status_code == 409


# ───────────────────────── PUT per perspektif ─────────────────────────
async def test_put_customer_replaces(client, admin, refs, db):
    pid = (await create(client, admin, project_payload(refs))).json()["data"]["id"]
    body = {"customer_name": "PT Telkomsel", "company_size_id": None, "industry_id": refs["industry"]["GOVERNMENT"]}
    response = await client.put(f"{URL}/{pid}/customer", json=body, headers=admin)
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["customer_name"] == "PT Telkomsel" and data["company_size"] is None
    assert data["customer_location"] is None  # PUT mengganti seluruhnya
    assert (await db.execute(select(func.count(Customer.id)))).scalar_one() == 1

    bad = await client.put(f"{URL}/{pid}/customer", json={**body, "industry_id": "00000000-0000-0000-0000-000000000009"}, headers=admin)
    assert bad.status_code == 422


async def test_put_financial_visibility(client, admin, engineer, refs):
    pid = (await create(client, admin, project_payload(refs))).json()["data"]["id"]

    by_admin = await client.put(f"{URL}/{pid}/financial", json={"cogs": "500000", "operational_cost": "0"}, headers=admin)
    assert by_admin.status_code == 200, by_admin.text
    assert Decimal(str(by_admin.json()["data"]["net_profit"])) == Decimal("500000")

    # penulis tanpa financial.view boleh mengisi, tapi tidak mendapat angkanya kembali
    by_engineer = await client.put(f"{URL}/{pid}/financial", json={"cogs": "1", "operational_cost": "2"}, headers=engineer)
    assert by_engineer.status_code == 200 and by_engineer.json()["data"] is None
    after = await client.patch(f"{URL}/{pid}", json={"project_name": "same"}, headers=admin)
    assert Decimal(str(after.json()["data"]["financial"]["cogs"])) == Decimal("1")

    assert (await client.put(f"{URL}/{pid}/financial", json={"cogs": "-1"}, headers=admin)).status_code == 422


async def test_put_products_and_tech_stacks_replace(client, admin, refs):
    pid = (await create(client, admin, project_payload(refs))).json()["data"]["id"]

    response = await client.put(f"{URL}/{pid}/products", json={"product_ids": refs["products"][1:3]}, headers=admin)
    assert response.status_code == 200, response.text
    assert len(response.json()["data"]["products"]) == len(refs["products"][1:3])

    cleared = await client.put(f"{URL}/{pid}/products", json={"product_ids": []}, headers=admin)
    assert cleared.json()["data"]["products"] == []

    stacks = await client.put(
        f"{URL}/{pid}/tech-stacks", json={"tech_stack_ids": [refs["tech"]["data_storage"][0]]}, headers=admin
    )
    data = stacks.json()["data"]
    assert data["frontend"] == [] and data["backend"] == [] and len(data["data_storage"]) == 1

    bad = await client.put(f"{URL}/{pid}/tech-stacks", json={"tech_stack_ids": ["00000000-0000-0000-0000-000000000009"]}, headers=admin)
    assert bad.status_code == 422 and bad.json()["error"]["code"] == "INVALID_REFERENCE"


async def test_put_partners(client, admin, refs):
    pid = (await create(client, admin, project_payload(refs))).json()["data"]["id"]
    alpha, beta = refs["partners"]["alpha"], refs["partners"]["beta"]

    response = await client.put(
        f"{URL}/{pid}/partners",
        json={"partners": [
            {"partner_id": alpha, "partner_role": "Vendor", "partner_contribution": "Support"},  # huruf besar dinormalkan
            {"partner_id": alpha, "partner_role": "principal"},  # partner sama, peran lain: boleh
        ]},
        headers=admin,
    )
    assert response.status_code == 200, response.text
    assert [(p["partner_role"], p["partner_contribution"]) for p in response.json()["data"]] == [
        ("principal", None),
        ("vendor", "Support"),
    ]

    duplicate = await client.put(
        f"{URL}/{pid}/partners",
        json={"partners": [{"partner_id": beta, "partner_role": "vendor"}, {"partner_id": beta, "partner_role": "VENDOR"}]},
        headers=admin,
    )
    assert duplicate.status_code == 422
    assert (await client.put(f"{URL}/{pid}/partners", json={"partners": []}, headers=admin)).json()["data"] == []


async def test_put_success_metrics(client, admin, refs):
    pid = (await create(client, admin, project_payload(refs))).json()["data"]["id"]
    body = {"success_metrics": [
        {"success_metric_value": "-40%", "success_metric_label": "Cost", "sort_order": 2},
        {"success_metric_value": "95%", "success_metric_label": "CSAT", "sort_order": 1},
    ]}
    response = await client.put(f"{URL}/{pid}/success-metrics", json=body, headers=admin)
    assert response.status_code == 200, response.text
    assert [m["success_metric_value"] for m in response.json()["data"]] == ["95%", "-40%"]  # urut sort_order

    assert (await client.put(f"{URL}/{pid}/success-metrics", json={"success_metrics": [
        {"success_metric_value": "", "success_metric_label": "x"}]}, headers=admin)).status_code == 422
    assert (await client.put(f"{URL}/{pid}/success-metrics", json={"success_metrics": []}, headers=admin)).json()["data"] == []


# ───────────────────────── file project (GCS palsu) ─────────────────────────
PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
PDF = b"%PDF-1.4\n" + b"0" * 64
WEBP = b"RIFF\x00\x00\x00\x00WEBPVP8 " + b"\x00" * 32
MP4 = b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 32


def docx_bytes() -> bytes:
    import io
    import zipfile

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w") as archive:
        archive.writestr("[Content_Types].xml", "<Types/>")
        archive.writestr("word/document.xml", "<w/>")
    return buffer.getvalue()


async def upload(client, headers, pid, content, name, category, mime=None, **extra):
    return await client.post(
        f"{URL}/{pid}/files",
        files={"file": (name, content, mime or "application/octet-stream")},
        data={"file_category": category, **extra},
        headers=headers,
    )


@pytest.fixture
async def pid(client, admin, refs):
    return (await create(client, admin, project_payload(refs, code="FILES_1"))).json()["data"]["id"]


async def test_upload_ok_and_hides_storage_key(client, admin, pid, fake_storage):
    response = await upload(client, admin, pid, PNG, "C:\\fakepath\\foto.png", "image", "image/png", file_title="Foto", sort_order="2")
    assert response.status_code == 201, response.text
    data = response.json()["data"]
    assert data["file_name"] == "foto.png"  # path folder dibuang
    assert data["mime_type"] == "image/png" and data["file_size_bytes"] == len(PNG) and data["sort_order"] == 2
    assert "storage_key" not in data
    assert len(fake_storage.objects) == 1
    key = next(iter(fake_storage.objects))
    assert key.startswith(f"projects/{pid}/image/") and key.endswith(".png")


@pytest.mark.parametrize("content,name,category", [
    (WEBP, "a.webp", "image"),
    (MP4, "a.mp4", "video"),
    (PDF, "a.pdf", "document"),
    (None, "a.docx", "document"),
])
async def test_upload_supported_types(client, admin, pid, content, name, category):
    content = content or docx_bytes()
    assert (await upload(client, admin, pid, content, name, category)).status_code == 201


async def test_upload_rejects_wrong_content(client, admin, pid, fake_storage):
    # nama .pdf dan Content-Type pdf, tetapi isinya teks biasa
    fake = await upload(client, admin, pid, b"just text, not a pdf", "evil.pdf", "document", "application/pdf")
    assert fake.status_code == 422
    # tipe benar tapi kategori salah
    assert (await upload(client, admin, pid, PDF, "a.pdf", "image")).status_code == 422
    assert (await upload(client, admin, pid, PNG, "a.png", "video")).status_code == 422
    # Content-Type kiriman klien tidak cocok dengan isi
    assert (await upload(client, admin, pid, PNG, "a.png", "image", "application/pdf")).status_code == 422
    # kategori tidak dikenal, file kosong
    assert (await upload(client, admin, pid, PNG, "a.png", "banner")).status_code == 422
    assert (await upload(client, admin, pid, b"", "a.png", "image")).status_code == 422
    assert fake_storage.objects == {}


async def test_upload_size_limit(client, admin, pid, fake_storage, monkeypatch):
    from app.settings import settings

    monkeypatch.setattr(settings, "PROJECT_FILE_MAX_IMAGE_MB", 0)
    assert (await upload(client, admin, pid, PNG, "a.png", "image")).status_code == 413
    assert fake_storage.objects == {}


async def test_one_case_study_per_project(client, admin, pid, fake_storage):
    assert (await upload(client, admin, pid, PDF, "cs.pdf", "case_study")).status_code == 201
    second = await upload(client, admin, pid, PDF, "cs2.pdf", "case_study")
    assert second.status_code == 409
    assert len(fake_storage.objects) == 1  # yang ditolak tidak sempat masuk bucket
    assert (await upload(client, admin, pid, docx_bytes(), "cs.docx", "case_study")).status_code == 422  # case study = PDF


async def test_gcs_failure_leaves_no_row(client, admin, pid, fake_storage, db):
    from app.models.project_file_model import ProjectFile

    fake_storage.fail_upload = True
    assert (await upload(client, admin, pid, PNG, "a.png", "image")).status_code == 502
    assert (await db.execute(select(func.count(ProjectFile.id)))).scalar_one() == 0


async def test_database_failure_rolls_back_gcs_object(client, admin, pid, fake_storage, monkeypatch):
    from app.api.projects.repository import ProjectRepository

    async def broken_save(self):
        raise RuntimeError("database down")

    monkeypatch.setattr(ProjectRepository, "save", broken_save)
    with pytest.raises(RuntimeError):
        await upload(client, admin, pid, PNG, "a.png", "image")
    assert fake_storage.objects == {}  # file di bucket dibersihkan


async def test_update_file_metadata(client, admin, pid):
    file_id = (await upload(client, admin, pid, PNG, "a.png", "image")).json()["data"]["id"]
    url = f"{URL}/{pid}/files/{file_id}"
    response = await client.patch(url, json={"file_title": "Baru", "sort_order": 5}, headers=admin)
    assert response.status_code == 200 and response.json()["data"]["file_title"] == "Baru"
    assert (await client.patch(url, json={}, headers=admin)).status_code == 400
    assert (await client.patch(url, json={"sort_order": None}, headers=admin)).status_code == 422
    assert (await client.patch(url, json={"storage_key": "x"}, headers=admin)).status_code == 422


async def test_delete_file_removes_row_and_object(client, admin, pid, fake_storage):
    file_id = (await upload(client, admin, pid, PNG, "a.png", "image")).json()["data"]["id"]
    assert (await client.delete(f"{URL}/{pid}/files/{file_id}", headers=admin)).status_code == 200
    assert fake_storage.objects == {}
    assert (await client.delete(f"{URL}/{pid}/files/{file_id}", headers=admin)).status_code == 404


async def test_delete_file_survives_gcs_failure(client, admin, pid, fake_storage):
    file_id = (await upload(client, admin, pid, PNG, "a.png", "image")).json()["data"]["id"]
    fake_storage.fail_delete = True
    assert (await client.delete(f"{URL}/{pid}/files/{file_id}", headers=admin)).status_code == 200
    assert (await client.get(f"{URL}/{pid}/files/{file_id}/download", headers=admin)).status_code == 404


async def test_download_link_and_permissions(client, admin, commercial, no_role, pid):
    file_id = (await upload(client, admin, pid, PDF, "laporan.pdf", "document")).json()["data"]["id"]
    url = f"{URL}/{pid}/files/{file_id}/download"

    response = await client.get(url, headers=commercial)  # view saja cukup untuk mengunduh
    assert response.status_code == 200, response.text
    data = response.json()["data"]
    assert data["download_url"].startswith("https://storage.example/projects/") and data["file_name"] == "laporan.pdf"
    assert (await client.get(url, headers=no_role)).status_code == 403


async def test_file_of_other_or_deleted_project_is_404(client, admin, refs, pid):
    file_id = (await upload(client, admin, pid, PNG, "a.png", "image")).json()["data"]["id"]
    other = (await create(client, admin, project_payload(refs, code="FILES_2"))).json()["data"]["id"]

    assert (await client.get(f"{URL}/{other}/files/{file_id}/download", headers=admin)).status_code == 404
    await client.delete(f"{URL}/{pid}", headers=admin)
    assert (await client.get(f"{URL}/{pid}/files/{file_id}/download", headers=admin)).status_code == 404
    assert (await upload(client, admin, pid, PNG, "b.png", "image")).status_code == 404
