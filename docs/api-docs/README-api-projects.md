# Portfolio API — Project Endpoints (overview)

Date: 2026-11-17

Documentation for the backend Portfolio endpoints under `/api/v1/projects`. One file per endpoint, in the same format as `api-site-nms.md`.

## Endpoints

| # | Method | Path | Permission | Doc |
|---|---|---|---|---|
| 1 | POST | `/api/v1/projects` | `portfolio.manage` | [api-projects-create.md](api-projects-create.md) |
| 2 | PATCH | `/api/v1/projects/{project_id}` | `portfolio.manage` | [api-projects-update.md](api-projects-update.md) |
| 3 | DELETE | `/api/v1/projects/{project_id}` | `portfolio.manage` | [api-projects-delete.md](api-projects-delete.md) |
| 4 | PUT | `/api/v1/projects/{project_id}/customer` | `portfolio.manage` | [api-projects-put-customer.md](api-projects-put-customer.md) |
| 5 | PUT | `/api/v1/projects/{project_id}/financial` | `portfolio.manage` | [api-projects-put-financial.md](api-projects-put-financial.md) |
| 6 | PUT | `/api/v1/projects/{project_id}/products` | `portfolio.manage` | [api-projects-put-products.md](api-projects-put-products.md) |
| 7 | PUT | `/api/v1/projects/{project_id}/tech-stacks` | `portfolio.manage` | [api-projects-put-tech-stacks.md](api-projects-put-tech-stacks.md) |
| 8 | PUT | `/api/v1/projects/{project_id}/partners` | `portfolio.manage` | [api-projects-put-partners.md](api-projects-put-partners.md) |
| 9 | PUT | `/api/v1/projects/{project_id}/success-metrics` | `portfolio.manage` | [api-projects-put-success-metrics.md](api-projects-put-success-metrics.md) |
| 10 | POST | `/api/v1/projects/{project_id}/files` | `portfolio.manage` | [api-projects-upload-file.md](api-projects-upload-file.md) |
| 11 | PATCH | `/api/v1/projects/{project_id}/files/{file_id}` | `portfolio.manage` | [api-projects-update-file.md](api-projects-update-file.md) |
| 12 | DELETE | `/api/v1/projects/{project_id}/files/{file_id}` | `portfolio.manage` | [api-projects-delete-file.md](api-projects-delete-file.md) |
| 13 | GET | `/api/v1/projects/{project_id}/files/{file_id}/download` | `portfolio.view` | [api-projects-download-file.md](api-projects-download-file.md) |

## Base URL

Local development: `http://localhost:8000` (Swagger UI at `http://localhost:8000/docs`). Staging and production URLs: to be filled in by the team.

## Authentication

Every endpoint needs `Authorization: Bearer <ACCESS_TOKEN>`. Get a token from `POST /api/v1/auth/login`. Tokens expire; when the API answers HTTP 401 `UNAUTHORIZED` ("Token tidak valid atau sudah kedaluwarsa"), log in again.

## Permissions

| Permission | Meaning |
|---|---|
| `portfolio.view` | read project data and download files |
| `portfolio.manage` | create, change and delete projects and their files |
| `financial.view` | see money fields (`value_before_tax`, `value_after_tax`, `carry_over_value`, `financial`) |

Default mapping from `seed_portfolio_permissions.sql` (to be confirmed by the team):

| Permission | Roles |
|---|---|
| `portfolio.view` | SUPER_ADMIN, COMMERCIAL_PARTNERSHIP_OFFICER, ENGINEER_PROJECT_LEAD |
| `portfolio.manage` | SUPER_ADMIN, ENGINEER_PROJECT_LEAD |
| `financial.view` | SUPER_ADMIN, COMMERCIAL_PARTNERSHIP_OFFICER |

Users without `financial.view` can still save money values; the money fields are simply left out of the responses.

## Response format

Success:

```json
{
  "success": true,
  "message": "Project berhasil ditambahkan.",
  "data": {
    "...": "..."
  },
  "meta": null
}
```

Error:

```json
{
  "success": false,
  "message": "Project tidak ditemukan.",
  "error": {
    "code": "NOT_FOUND",
    "details": null
  }
}
```

Error codes: `BAD_REQUEST` (400), `UNAUTHORIZED` (401), `FORBIDDEN` (403), `NOT_FOUND` (404), `CONFLICT` (409), `VALIDATION_ERROR` (422), `INVALID_REFERENCE` (422, unknown master-data id), `INVALID_DATE_RANGE` (422), `HTTP_ERROR` (other statuses such as 413 and 502), `INTERNAL_SERVER_ERROR` (500).

Note: a request with **no** `Authorization` header gets HTTP 403 (`FORBIDDEN`, "Not authenticated"), not 401. HTTP 401 is only for a token that is present but invalid or expired.

## Conventions

- **PUT replaces.** Every `PUT` sends the complete new content of that part; whatever is not sent is removed (or reset).
- **PATCH changes only what is sent.** Used for the main project fields and for file metadata.
- **Soft delete.** `DELETE /projects/{id}` hides the project; its `project_code` can be reused. File deletion is permanent.
- **Derived values are computed on read**, never stored: `total_days`, `remaining_days`, `progress_percent`, `is_overdue`, `value_after_tax`, `net_profit`, `net_margin_percent`.
- **Master data** (business units, statuses, customer attributes, products, tech stacks, partners) is referenced by UUID. An unknown id returns HTTP 422 `INVALID_REFERENCE` listing every bad id at once.
- **Dates** are `YYYY-MM-DD`; "today" is computed in WIB (UTC+7). Datetimes are UTC.
- **Money** is sent as a string or number and returned as a number with at most 2 decimals.

## Files (storage)

Files live in a private Google Cloud Storage bucket (`GCS_BUCKET_NAME`). They are never public; downloads use a signed URL valid for 300 seconds. Credentials come from `GCS_CREDENTIALS_FILE` (a service-account JSON, never committed) or, when empty, Application Default Credentials.
