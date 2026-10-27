from io import BytesIO

from openpyxl import load_workbook

from app.api.project_import.usecase import ProjectImportUseCase
from app.api.project_import.views import (
    download_project_import_template,
)
from app.main import app


def test_project_import_template_route_registered():
    matching_routes = [
        route
        for route in app.routes
        if route.path
        == "/api/v1/projects/import/template"
    ]

    assert len(matching_routes) == 1

    route = matching_routes[0]

    assert "GET" in route.methods


def test_download_project_import_template_response():
    use_case = ProjectImportUseCase(
        db=None,
    )

    response = download_project_import_template(
        _portfolio_user=None,
        use_case=use_case,
    )

    assert response.status_code == 200

    assert response.media_type == (
        "application/vnd.openxmlformats-"
        "officedocument.spreadsheetml.sheet"
    )

    assert response.headers[
        "content-disposition"
    ] == (
        'attachment; filename="'
        'portfolio_import_template.xlsx"'
    )

    workbook = load_workbook(
        BytesIO(response.body),
        read_only=False,
    )

    worksheet = workbook["Sheet1"]

    assert (
        worksheet["A1"].value
        == "Customer Perspective"
    )
    assert (
        worksheet["I1"].value
        == "Project Perspective"
    )
    assert (
        worksheet["AC1"].value
        == "Financial Perspective"
    )
    assert (
        worksheet["AG1"].value
        == "Tech Stack"
    )
    assert (
        worksheet["AK1"].value
        == "Partner Perspective"
    )

    assert worksheet["A2"].value == "No"
    assert worksheet["B2"].value == "Customer"
    assert worksheet["O2"].value == "Project ID"
    assert (
        worksheet["P2"].value
        == "Project Value (before tax)"
    )
    assert worksheet["AK2"].value == "Partner"

    assert worksheet.max_column == 37

    workbook.close()