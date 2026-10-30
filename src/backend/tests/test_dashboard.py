from decimal import Decimal

import pytest
import pytest_asyncio

from tests.test_projects import project_payload


URL = "/api/v1/dashboard"
PROJECTS_URL = "/api/v1/projects"
FINANCIAL_KEYS = {"total_value_before_tax", "total_revenue", "total_net_profit"}
GROUP_ENDPOINTS = ("projects-by-business-unit", "projects-by-industry")
ENDPOINTS = ("summary", *GROUP_ENDPOINTS)


async def dashboard_data(client, headers, endpoint, **params):
    response = await client.get(f"{URL}/{endpoint}", headers=headers, params=params)
    assert response.status_code == 200, response.text
    body = response.json()
    assert body["success"] is True
    return body["data"]


def assert_summary(data, *, total, active, statuses, value, profit):
    assert data["total_projects"] == total
    assert data["active_projects"] == active
    assert len(data["status_counts"]) == len(statuses)
    assert {row["code"]: row["count"] for row in data["status_counts"]} == statuses
    assert Decimal(str(data["total_value_before_tax"])) == Decimal(value)
    assert Decimal(str(data["total_revenue"])) == Decimal(value)
    assert Decimal(str(data["total_net_profit"])) == Decimal(profit)


@pytest_asyncio.fixture
async def dashboard_projects(client, admin, refs):
    # Proposal value/costs must never contribute to financial totals.
    cases = [
        ("ongoing", "ON_GOING", "ITMS", "GOVERNMENT", 2026, "1000.25", "200.10", "100.05"),
        ("closed", "CLOSED", "CSD", "AGRICULTURE", 2025, "2000.50", "500.20", "200.10"),
        ("proposal", "ON_PROPOSAL", "ITMS", "AGRICULTURE", 2026, "9000", "90", "10"),
        ("other", "ON_GOING", "CSD", "GOVERNMENT", 2026, "400.25", "50.10", "25.05"),
    ]
    projects = {}
    for key, status, unit, industry, year, value, cogs, cost in cases:
        payload = project_payload(
            refs,
            code=f"DASH_{key.upper()}",
            project_status_id=refs["status"][status],
            business_unit_id=refs["business_unit"][unit],
            year=year,
            value_before_tax=value,
            financial={"cogs": cogs, "operational_cost": cost},
        )
        payload["customer"]["industry_id"] = refs["industry"][industry]
        response = await client.post(PROJECTS_URL, headers=admin, json=payload)
        assert response.status_code == 201, response.text
        projects[key] = response.json()["data"]["id"]
    return projects


async def test_summary_with_financial_permission(client, admin, refs, dashboard_projects):
    data = await dashboard_data(client, admin, "summary")
    assert_summary(
        data,
        total=4,
        active=2,
        statuses={"ON_GOING": 2, "CLOSED": 1, "ON_PROPOSAL": 1},
        value="3401.00",
        profit="2325.40",
    )
    for row in data["status_counts"]:
        assert row["id"] == refs["status"][row["code"]]
        assert row["name"]


async def test_summary_without_financial_permission(client, admin, engineer, dashboard_projects):
    visible = await dashboard_data(client, admin, "summary")
    hidden = await dashboard_data(client, engineer, "summary")
    assert FINANCIAL_KEYS.isdisjoint(hidden)
    assert hidden["total_projects"] == 4
    assert hidden["active_projects"] == 2
    assert hidden == {key: value for key, value in visible.items() if key not in FINANCIAL_KEYS}


@pytest.mark.parametrize(
    "endpoint, reference, expected",
    [
        (
            "projects-by-business-unit",
            "business_unit",
            [("ITMS", 2, "1000.25"), ("CSD", 2, "2400.75")],
        ),
        (
            "projects-by-industry",
            "industry",
            [("GOVERNMENT", 2, "1400.50"), ("AGRICULTURE", 2, "2000.50")],
        ),
    ],
)
async def test_grouped_projects(
    client, admin, refs, dashboard_projects, endpoint, reference, expected
):
    rows = await dashboard_data(client, admin, endpoint)
    assert len(rows) == len(expected)
    assert [row["code"] for row in rows] == [code for code, _, _ in expected]
    for row, (code, count, value) in zip(rows, expected):
        assert row["id"] == refs[reference][code]
        assert row["name"]
        assert row["project_count"] == count
        assert Decimal(str(row["total_value_before_tax"])) == Decimal(value)


@pytest.mark.parametrize("endpoint", GROUP_ENDPOINTS)
async def test_grouped_financial_fields_hidden(client, admin, engineer, dashboard_projects, endpoint):
    visible = await dashboard_data(client, admin, endpoint)
    hidden = await dashboard_data(client, engineer, endpoint)
    assert len(hidden) == 2
    assert all("total_value_before_tax" not in row for row in hidden)
    assert hidden == [
        {key: value for key, value in row.items() if key != "total_value_before_tax"}
        for row in visible
    ]


@pytest.mark.parametrize(
    "filter_values, project_keys, active, statuses, value, profit, units, industries",
    [
        (
            {"year": 2026},
            ("ongoing", "proposal", "other"),
            2,
            {"ON_GOING": 2, "ON_PROPOSAL": 1},
            "1400.50",
            "1025.20",
            {"ITMS": (2, "1000.25"), "CSD": (1, "400.25")},
            {"GOVERNMENT": (2, "1400.50"), "AGRICULTURE": (1, "0")},
        ),
        (
            {"business_unit_id": "ITMS"},
            ("ongoing", "proposal"),
            1,
            {"ON_GOING": 1, "ON_PROPOSAL": 1},
            "1000.25",
            "700.10",
            {"ITMS": (2, "1000.25")},
            {"GOVERNMENT": (1, "1000.25"), "AGRICULTURE": (1, "0")},
        ),
        (
            {"industry_id": "AGRICULTURE"},
            ("closed", "proposal"),
            0,
            {"CLOSED": 1, "ON_PROPOSAL": 1},
            "2000.50",
            "1300.20",
            {"ITMS": (1, "0"), "CSD": (1, "2000.50")},
            {"AGRICULTURE": (2, "2000.50")},
        ),
        (
            {"year": 2026, "business_unit_id": "CSD", "industry_id": "GOVERNMENT"},
            ("other",),
            1,
            {"ON_GOING": 1},
            "400.25",
            "325.10",
            {"CSD": (1, "400.25")},
            {"GOVERNMENT": (1, "400.25")},
        ),
    ],
    ids=["year", "business-unit", "industry", "combined-and"],
)
async def test_filters_match_project_listing(
    client, admin, refs, dashboard_projects,
    filter_values, project_keys, active, statuses, value, profit, units, industries,
):
    params = dict(filter_values)
    for field, reference in (("business_unit_id", "business_unit"), ("industry_id", "industry")):
        if field in params:
            params[field] = refs[reference][params[field]]

    listed = await client.get(PROJECTS_URL, headers=admin, params=params)
    assert listed.status_code == 200, listed.text
    assert {row["id"] for row in listed.json()["data"]["items"]} == {
        dashboard_projects[key] for key in project_keys
    }

    data = await dashboard_data(client, admin, "summary", **params)
    assert_summary(
        data,
        total=len(project_keys),
        active=active,
        statuses=statuses,
        value=value,
        profit=profit,
    )
    for endpoint, expected in zip(GROUP_ENDPOINTS, (units, industries)):
        rows = await dashboard_data(client, admin, endpoint, **params)
        assert len(rows) == len(expected)
        assert {
            row["code"]: (row["project_count"], Decimal(str(row["total_value_before_tax"])))
            for row in rows
        } == {code: (count, Decimal(amount)) for code, (count, amount) in expected.items()}


async def test_soft_deleted_project_excluded(client, admin, dashboard_projects):
    before = await dashboard_data(client, admin, "summary")
    assert before["total_projects"] == 4
    response = await client.delete(
        f"{PROJECTS_URL}/{dashboard_projects['closed']}", headers=admin
    )
    assert response.status_code == 200, response.text

    data = await dashboard_data(client, admin, "summary")
    assert_summary(
        data,
        total=3,
        active=2,
        statuses={"ON_GOING": 2, "ON_PROPOSAL": 1},
        value="1400.50",
        profit="1025.20",
    )
    for endpoint, code, count, value in (
        ("projects-by-business-unit", "CSD", 1, "400.25"),
        ("projects-by-industry", "AGRICULTURE", 1, "0"),
    ):
        rows = await dashboard_data(client, admin, endpoint)
        assert sum(row["project_count"] for row in rows) == 3
        row = next(row for row in rows if row["code"] == code)
        assert row["project_count"] == count
        assert Decimal(str(row["total_value_before_tax"])) == Decimal(value)


@pytest.mark.parametrize("endpoint", ENDPOINTS)
async def test_dashboard_requires_portfolio_view(client, no_role, endpoint):
    response = await client.get(f"{URL}/{endpoint}", headers=no_role)
    assert response.status_code == 403, response.text


async def test_empty_dashboard(client, admin):
    data = await dashboard_data(client, admin, "summary")
    assert_summary(data, total=0, active=0, statuses={}, value="0", profit="0")
    for endpoint in GROUP_ENDPOINTS:
        assert await dashboard_data(client, admin, endpoint) == []
