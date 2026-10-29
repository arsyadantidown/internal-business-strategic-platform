"""GET /customers/names dan /customers/locations (v3 bagian 3, Customer API)."""

import pytest

from tests.test_projects import create, project_payload

NAMES_URL = "/api/v1/customers/names"
LOCATIONS_URL = "/api/v1/customers/locations"


def customer(refs, name, location):
    body = project_payload(refs)["customer"]
    body.update(customer_name=name, customer_location=location)
    return body


async def add_project(client, headers, refs, code, name, location):
    response = await create(client, headers, project_payload(refs, code=code, customer=customer(refs, name, location)))
    assert response.status_code in (200, 201), response.text
    return response.json()["data"]["id"]


@pytest.fixture
async def seeded(client, admin, refs):
    """5 project live + 1 project yang di-soft delete."""
    await add_project(client, admin, refs, "CUS_1", "PT ABC Bank", "Jakarta")
    await add_project(client, admin, refs, "CUS_2", "PT ABC Bank", "jakarta")
    await add_project(client, admin, refs, "CUS_3", "pt abc bank", "Jakarta")
    await add_project(client, admin, refs, "CUS_4", "Bank Mandiri", None)
    await add_project(client, admin, refs, "CUS_5", "Telkom", "Bandung")
    deleted = await add_project(client, admin, refs, "CUS_6", "Hapus Corp", "Surabaya")
    response = await client.delete(f"/api/v1/projects/{deleted}", headers=admin)
    assert response.status_code in (200, 204), response.text


async def test_names_grouped_and_most_frequent_spelling(client, admin, seeded):
    response = await client.get(NAMES_URL, headers=admin)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["success"] is True
    # Urut abjad tanpa beda huruf; "Hapus Corp" milik project terhapus tidak ikut.
    assert body["data"] == [
        {"customer_name": "Bank Mandiri"},
        {"customer_name": "PT ABC Bank"},
        {"customer_name": "Telkom"},
    ]


async def test_names_search_is_case_insensitive(client, admin, seeded):
    response = await client.get(NAMES_URL, params={"search": "ABC"}, headers=admin)
    assert response.json()["data"] == [{"customer_name": "PT ABC Bank"}]

    response = await client.get(NAMES_URL, params={"search": "bank"}, headers=admin)
    assert [item["customer_name"] for item in response.json()["data"]] == ["Bank Mandiri", "PT ABC Bank"]

    response = await client.get(NAMES_URL, params={"search": "hapus"}, headers=admin)
    assert response.json()["data"] == []


async def test_names_tie_still_returns_one_item(client, admin, refs):
    await add_project(client, admin, refs, "TIE_1", "pt xyz", "Medan")
    await add_project(client, admin, refs, "TIE_2", "PT XYZ", "Medan")
    response = await client.get(NAMES_URL, headers=admin)
    data = response.json()["data"]
    assert len(data) == 1 and data[0]["customer_name"] in ("pt xyz", "PT XYZ")


async def test_locations_grouped_and_skip_empty_and_deleted(client, admin, seeded):
    response = await client.get(LOCATIONS_URL, headers=admin)
    assert response.status_code == 200, response.text
    # "Jakarta" dipakai 2 kali, "jakarta" 1 kali → tampil "Jakarta". "Surabaya" milik project terhapus.
    assert response.json()["data"] == [
        {"customer_location": "Bandung"},
        {"customer_location": "Jakarta"},
    ]


async def test_empty_when_no_projects(client, admin):
    assert (await client.get(NAMES_URL, headers=admin)).json()["data"] == []
    assert (await client.get(LOCATIONS_URL, headers=admin)).json()["data"] == []


@pytest.mark.parametrize("url", [NAMES_URL, LOCATIONS_URL])
async def test_all_portfolio_roles_can_read(client, admin, engineer, commercial, url):
    for headers in (admin, engineer, commercial):
        assert (await client.get(url, headers=headers)).status_code == 200


@pytest.mark.parametrize("url", [NAMES_URL, LOCATIONS_URL])
async def test_without_login_or_permission_is_rejected(client, no_role, url):
    assert (await client.get(url)).status_code == 403
    assert (await client.get(url, headers=no_role)).status_code == 403
