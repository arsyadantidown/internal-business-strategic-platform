# API: Update Project (api-projects-update)

Endpoint: `PATCH /api/v1/projects/{project_id}`

## Description

Partially update the main project fields. Only the fields present in the body change; everything else stays as it is. Customer, financial, products, tech stacks, partners and success metrics are changed through their own `PUT` endpoints.

## Authentication

Bearer token (JWT) expected in the `Authorization` header. The user's role must have the permission `portfolio.manage`.

## Base URL

All examples use the local development URL. Replace with your environment (staging / production URLs to be filled in by the team).

`http://localhost:8000`

## Request

Path parameters:

- `project_id` (UUID, required) — id of the project (the `data.id` returned by `POST /api/v1/projects`).

Headers:

- `Authorization: Bearer <ACCESS_TOKEN>` — access token from `POST /api/v1/auth/login`. Do not share real tokens in public docs.
- `Content-Type: application/json`

Body (JSON): any subset of the main project fields (all optional): `project_code`, `opportunity`, `project_name`, `year`, `contract_name`, `contract_number`, `business_unit_id`, `project_status_id`, `value_before_tax`, `carry_over_value`, `project_manager`, `account_manager`, `start_date`, `end_date`, `project_objective`, `project_description`, `project_background`, `project_challenges`, `project_solution`, `is_featured`. Same rules as in *Create Project*. Unknown fields are rejected.


## Sample curl

```bash
curl --request PATCH \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
  "project_name": "Monitoring Jaringan Bank Mandiri",
  "project_manager": "Andi"
}'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Project berhasil diperbarui.",
  "data": {
    "id": "eb464f53-b4ee-4e6f-af8b-0cd1332b822d",
    "project_code": "ITMS_MON_BMRI_2026_PRO",
    "project_name": "Monitoring Jaringan Bank Mandiri",
    "year": 2026,
    "is_featured": false,
    "opportunity": "OPP-2026-014",
    "contract_name": "Kontrak Monitoring Bank Mandiri",
    "contract_number": "K-001/2026",
    "business_unit": {
      "id": "2919b5c6-1500-4220-b46f-020bbb1f0f92",
      "code": "ITMS",
      "name": "ITMS"
    },
    "project_status": {
      "id": "d137ea44-19a8-4671-9b95-87cf931fa1b4",
      "code": "ON_GOING",
      "name": "On Going"
    },
    "project_manager": "Andi",
    "account_manager": "Sari",
    "start_date": "2026-08-09",
    "end_date": "2027-02-25",
    "total_days": 200,
    "remaining_days": 100,
    "progress_percent": 50.0,
    "is_overdue": false,
    "project_objective": "Memantau seluruh jaringan secara terpusat.",
    "project_description": null,
    "project_background": null,
    "project_challenges": null,
    "project_solution": null,
    "customer": {
      "id": "cb3f49ef-7302-40a5-960e-424e023c43dd",
      "customer_name": "PT Bank Mandiri",
      "customer_location": "Jakarta",
      "annual_revenue": "115T (FY 2025)",
      "company_size": {
        "id": "d6d1012a-90c5-4df1-a4d7-680aa215fc08",
        "code": "TIER_1",
        "name": "Tier 1 : Strategic/Enterprise (>1T)"
      },
      "customer_type": {
        "id": "e24de79f-2b07-4b56-8043-472c3086132b",
        "code": "STRATEGIC_CUSTOMER",
        "name": "Strategic Customer"
      },
      "industry": {
        "id": "34dd5d8a-5d96-452a-acee-acfc0640958d",
        "code": "GOVERNMENT",
        "name": "Government"
      },
      "legal_structure": {
        "id": "a3ff1961-9ffb-496a-b362-3c442742f31e",
        "code": "STATE_OWNED_ENTERPRISE",
        "name": "State-owned Enterprise"
      }
    },
    "tech_stack": {
      "products": [
        {
          "id": "9f602c8b-53e7-4a2f-bf89-837f7c48e537",
          "name": "Bliv AI"
        }
      ],
      "frontend": [
        {
          "id": "1650a991-68a0-49e5-a396-1526a333e8bf",
          "name": "Vue.js (Vue, Vue2, Vue3)"
        }
      ],
      "backend": [
        {
          "id": "707dfc23-6b3f-48c4-aaf3-4226f7553662",
          "name": "Python (Flask API, FastAPI)"
        }
      ],
      "data_storage": []
    },
    "partners": [
      {
        "partner_id": "d52801b9-9876-4260-bef1-87e687af8338",
        "partner_name": "Partner alpha cc706c59",
        "partner_role": "principal",
        "partner_contribution": null
      },
      {
        "partner_id": "6cf22d42-d40e-4b54-9039-ea43b92a1263",
        "partner_name": "Partner beta cc706c59",
        "partner_role": "vendor",
        "partner_contribution": "Implementasi"
      }
    ],
    "success_metrics": [
      {
        "id": "8f2538a9-f03f-4f26-a3e1-51a1aa6cc6c4",
        "success_metric_value": "+60%",
        "success_metric_label": "Digital users",
        "sort_order": 1
      }
    ],
    "files": [],
    "created_at": "2026-11-17T03:00:54.838878+00:00",
    "updated_at": "2026-11-17T03:00:54.982130+00:00",
    "value_before_tax": 1000000.0,
    "value_after_tax": 1110000.0,
    "carry_over_value": null,
    "financial": {
      "revenue": 1000000.0,
      "cogs": 200000.0,
      "operational_cost": 100000.0,
      "net_profit": 700000.0,
      "net_margin_percent": 70.0,
      "value_after_tax": 1110000.0
    }
  },
  "meta": null
}
```

Notes:

- Returns the full project, same shape as *Create Project*. Money fields only for users with `financial.view`.
- An empty body (`{}`) is rejected with HTTP 400.
- Required fields (`project_code`, `project_name`, `year`, `business_unit_id`, `project_status_id`, `value_before_tax`, `start_date`, `end_date`, `is_featured`) cannot be set to `null`. Optional text fields can be cleared with `null` or an empty string.
- The date rule is checked against the final values: `end_date` must still be after `start_date`, even if only one of them is sent.
- Changing `project_code` to one used by another live project returns HTTP 409.

## Error responses

1. Empty body (HTTP 400):

```json
{
  "success": false,
  "message": "Tidak ada data yang diperbarui.",
  "error": {
    "code": "BAD_REQUEST",
    "details": null
  }
}
```

2. Required field set to `null` (HTTP 422):

```json
{
  "success": false,
  "message": "Validasi request gagal",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "type": "string_type",
        "loc": [
          "body",
          "project_name"
        ],
        "msg": "Input should be a valid string",
        "input": "<submitted value>"
      }
    ]
  }
}
```

3. `end_date` not after `start_date` (HTTP 422): `error.code` = `INVALID_DATE_RANGE`, message `end_date harus setelah start_date.`

4. `project_code` used by another project: HTTP 409, same body as in *Create Project*.

5. Unknown `business_unit_id` / `project_status_id`: HTTP 422 `INVALID_REFERENCE`, same shape as in *Create Project*.

6. Missing `Authorization` header (HTTP 403)::

```json
{
  "success": false,
  "message": "Not authenticated",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  }
}
```

7. Invalid or expired access token (HTTP 401)::

```json
{
  "success": false,
  "message": "Token tidak valid atau sudah kedaluwarsa",
  "error": {
    "code": "UNAUTHORIZED",
    "details": null
  }
}
```

8. Authenticated, but the user's role does not have `portfolio.manage` (HTTP 403)::

```json
{
  "success": false,
  "message": "Anda tidak memiliki izin untuk melakukan tindakan ini.",
  "error": {
    "code": "FORBIDDEN",
    "details": null
  }
}
```

9. Project not found or already deleted (HTTP 404)::

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

10. `project_id` is not a valid UUID: HTTP 422 with `error.code` = `VALIDATION_ERROR` (same shape as the validation example, `loc` = `["path", "project_id"]`).

## Field definitions

Top-level response fields:

- `success` (boolean) — `true` on success, `false` on error
- `message` (string) — short human-facing message (Bahasa Indonesia)
- `data` (object|array|null, success only) — payload described below
- `meta` (object|null, success only) — currently always `null`
- `error` (object, error responses only) — `code` (string) and `details` (array|object|null)

Request/response fields are the same as in *Create Project* (see `api-projects-create.md`).

