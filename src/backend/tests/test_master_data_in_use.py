"""DELETE product, tech stack, partner, dan master data yang masih dipakai project,
termasuk project yang sudah di-soft delete (v3 bagian 2, aturan hapus dan ubah data)."""

import uuid

import pytest

from tests.test_projects import create, project_payload

API = "/api/v1"


def unique(prefix):
    return f"{prefix} {uuid.uuid4().hex[:8]}"


async def ok(response):
    assert response.status_code in (200, 201), response.text
    return response.json()["data"]


async def product_status_id(client, headers):
    items = await ok(await client.get(f"{API}/master-data/product-statuses", headers=headers))
    return items[0]["id"]


async def new_product(client, headers):
    body = {"product_name": unique("Produk Uji"), "product_status_id": await product_status_id(client, headers)}
    return (await ok(await client.post(f"{API}/products", json=body, headers=headers)))["id"]


async def new_tech_stack(client, headers):
    body = {"tech_stack_category": "backend", "tech_stack_name": unique("Stack Uji")}
    return (await ok(await client.post(f"{API}/tech-stacks", json=body, headers=headers)))["id"]


async def new_partner(client, headers):
    body = {"partner_name": unique("Partner Uji")}
    return (await ok(await client.post(f"{API}/partners", json=body, headers=headers)))["id"]


async def new_industry(client, headers):
    code = f"ZZ_UJI_{uuid.uuid4().hex[:6].upper()}"
    body = {"industry_code": code, "industry_name": unique("Industri Uji")}
    return (await ok(await client.post(f"{API}/master-data/industries", json=body, headers=headers)))["id"]


async def use_in_project(client, headers, refs, *, soft_delete, **override):
    payload = project_payload(refs, code=f"INUSE_{uuid.uuid4().hex[:6]}")
    if "industry_id" in override:
        payload["customer"]["industry_id"] = override.pop("industry_id")
    payload.update(override)
    project = await ok(await create(client, headers, payload))
    if soft_delete:
        response = await client.delete(f"{API}/projects/{project['id']}", headers=headers)
        assert response.status_code in (200, 204), response.text


@pytest.mark.parametrize("soft_delete", [False, True], ids=["project-live", "project-soft-deleted"])
async def test_product_in_use_is_rejected_with_409(client, admin, refs, soft_delete):
    product_id = await new_product(client, admin)
    await use_in_project(client, admin, refs, soft_delete=soft_delete, product_ids=[product_id])

    response = await client.delete(f"{API}/products/{product_id}", headers=admin)
    assert response.status_code == 409, response.text
    assert response.json()["success"] is False

    products = await ok(await client.get(f"{API}/products", headers=admin))
    assert product_id in [item["id"] for item in products]


@pytest.mark.parametrize("soft_delete", [False, True], ids=["project-live", "project-soft-deleted"])
async def test_tech_stack_in_use_is_deactivated(client, admin, refs, soft_delete):
    stack_id = await new_tech_stack(client, admin)
    tech = [refs["tech"]["frontend"][0], stack_id]
    await use_in_project(client, admin, refs, soft_delete=soft_delete, tech_stack_ids=tech)

    data = await ok(await client.delete(f"{API}/tech-stacks/{stack_id}", headers=admin))
    assert data == {"id": stack_id, "deleted": False, "is_active": False}

    active = await ok(await client.get(f"{API}/tech-stacks", headers=admin))
    assert stack_id not in [item["id"] for item in active]
    everything = await ok(await client.get(f"{API}/tech-stacks", params={"include_inactive": True}, headers=admin))
    assert stack_id in [item["id"] for item in everything]


@pytest.mark.parametrize("soft_delete", [False, True], ids=["project-live", "project-soft-deleted"])
async def test_partner_in_use_is_deactivated(client, admin, refs, soft_delete):
    partner_id = await new_partner(client, admin)
    partners = [{"partner_id": partner_id, "partner_role": "principal"}]
    await use_in_project(client, admin, refs, soft_delete=soft_delete, partners=partners)

    data = await ok(await client.delete(f"{API}/partners/{partner_id}", headers=admin))
    assert data == {"id": partner_id, "deleted": False, "is_active": False}

    active = await ok(await client.get(f"{API}/partners", headers=admin))
    assert partner_id not in [item["id"] for item in active]


@pytest.mark.parametrize("soft_delete", [False, True], ids=["project-live", "project-soft-deleted"])
async def test_master_data_in_use_is_deactivated(client, admin, refs, soft_delete):
    industry_id = await new_industry(client, admin)
    await use_in_project(client, admin, refs, soft_delete=soft_delete, industry_id=industry_id)

    data = await ok(await client.delete(f"{API}/master-data/industries/{industry_id}", headers=admin))
    assert data == {"id": industry_id, "deleted": False, "is_active": False}

    active = await ok(await client.get(f"{API}/master-data/industries", headers=admin))
    assert industry_id not in [item["id"] for item in active]


async def test_unused_items_are_really_deleted(client, admin):
    cases = [
        ("products", await new_product(client, admin)),
        ("tech-stacks", await new_tech_stack(client, admin)),
        ("partners", await new_partner(client, admin)),
        ("master-data/industries", await new_industry(client, admin)),
    ]
    for path, item_id in cases:
        data = await ok(await client.delete(f"{API}/{path}/{item_id}", headers=admin))
        assert data["deleted"] is True, path


async def test_delete_needs_manage_permission(client, commercial, admin):
    partner_id = await new_partner(client, admin)
    response = await client.delete(f"{API}/partners/{partner_id}", headers=commercial)
    assert response.status_code == 403
