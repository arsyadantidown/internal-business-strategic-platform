# API: Create Project (api-projects-create)

Endpoint: `POST /api/v1/projects`

## Description

Create a project together with its customer, financial data, products, tech stacks, partners and success metrics in a single transaction. If anything fails, nothing is saved. The same logic (`create_project`) is reused by the Excel import.

## Authentication

Bearer token (JWT) expected in the `Authorization` header. The user's role must have the permission `portfolio.manage`.

## Base URL

All examples use the local development URL. Replace with your environment (staging / production URLs to be filled in by the team).

`http://localhost:8000`

## Request

Headers:

- `Authorization: Bearer <ACCESS_TOKEN>` — access token from `POST /api/v1/auth/login`. Do not share real tokens in public docs.
- `Content-Type: application/json`

Body (JSON):

| Field | Type | Required | Rules |
|---|---|---|---|
| `project_code` | string | yes | max 100, trimmed. Unique (case-insensitive) among projects that are not deleted |
| `project_name` | string | yes | max 255 |
| `year` | integer | yes | 1900–2200 |
| `business_unit_id` | UUID | yes | must exist in `business_units` |
| `project_status_id` | UUID | yes | must exist in `project_statuses` |
| `value_before_tax` | decimal | yes | ≥ 0, max 2 decimals. Also used as `revenue` |
| `start_date` | date (`YYYY-MM-DD`) | yes | |
| `end_date` | date (`YYYY-MM-DD`) | yes | must be after `start_date` |
| `customer` | object | yes | see Customer object below |
| `opportunity` | string | no | max 255 |
| `contract_name` | string | no | max 255 |
| `contract_number` | string | no | max 150 |
| `carry_over_value` | decimal | no | ≥ 0 |
| `project_manager` | string | no | max 150 |
| `account_manager` | string | no | max 150 |
| `project_objective` | string | no | free text |
| `project_description` | string | no | free text |
| `project_background` | string | no | free text |
| `project_challenges` | string | no | free text |
| `project_solution` | string | no | free text |
| `is_featured` | boolean | no | default `false` |
| `financial` | object | no | `{cogs, operational_cost}`, both default `0` |
| `product_ids` | UUID[] | no | default `[]`; each must exist in `products` |
| `tech_stack_ids` | UUID[] | no | default `[]`; each must exist in `tech_stacks` |
| `partners` | object[] | no | default `[]`; see Partner object below |
| `success_metrics` | object[] | no | default `[]`; see Success metric object below |

Optional text fields sent as empty string or only spaces are stored as `null`. Unknown fields are rejected (HTTP 422).

Customer object:

| Field | Type | Required | Rules |
|---|---|---|---|
| `customer_name` | string | yes | max 255 |
| `customer_location` | string | no | max 255 |
| `annual_revenue` | string | no | max 100, free text (e.g. `"115T (FY 2025)"`) |
| `company_size_id` | UUID | no | must exist in `company_sizes` |
| `customer_type_id` | UUID | no | must exist in `customer_types` |
| `industry_id` | UUID | no | must exist in `industries` |
| `legal_structure_id` | UUID | no | must exist in `legal_structures` |

Partner object:

| Field | Type | Required | Rules |
|---|---|---|---|
| `partner_id` | UUID | yes | must exist in `partners` |
| `partner_role` | string | yes | `principal` or `vendor` (case-insensitive, stored lowercase) |
| `partner_contribution` | string | no | max 150 |

The same `(partner_id, partner_role)` pair may not appear twice.

Success metric object:

| Field | Type | Required | Rules |
|---|---|---|---|
| `success_metric_value` | string | yes | max 50 (e.g. `"+60%"`) |
| `success_metric_label` | string | yes | max 150 |
| `sort_order` | integer | no | 0–32767, default `0` |

## Sample curl

```bash
curl --request POST \
  --url 'http://localhost:8000/api/v1/projects' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
  "project_code": "ITMS_MON_BMRI_2026_PRO",
  "project_name": "Project ITMS_MON_BMRI_2026_PRO",
  "year": 2026,
  "business_unit_id": "2919b5c6-1500-4220-b46f-020bbb1f0f92",
  "project_status_id": "d137ea44-19a8-4671-9b95-87cf931fa1b4",
  "value_before_tax": "1000000",
  "project_manager": "Budi",
  "account_manager": "Sari",
  "start_date": "2026-08-09",
  "end_date": "2027-02-25",
  "customer": {
    "customer_name": "PT Bank Mandiri",
    "customer_location": "Jakarta",
    "annual_revenue": "115T (FY 2025)",
    "company_size_id": "d6d1012a-90c5-4df1-a4d7-680aa215fc08",
    "customer_type_id": "e24de79f-2b07-4b56-8043-472c3086132b",
    "industry_id": "34dd5d8a-5d96-452a-acee-acfc0640958d",
    "legal_structure_id": "a3ff1961-9ffb-496a-b362-3c442742f31e"
  },
  "financial": {
    "cogs": "200000",
    "operational_cost": "100000"
  },
  "product_ids": [
    "9f602c8b-53e7-4a2f-bf89-837f7c48e537"
  ],
  "tech_stack_ids": [
    "1650a991-68a0-49e5-a396-1526a333e8bf",
    "707dfc23-6b3f-48c4-aaf3-4226f7553662"
  ],
  "partners": [
    {
      "partner_id": "d52801b9-9876-4260-bef1-87e687af8338",
      "partner_role": "principal"
    },
    {
      "partner_id": "6cf22d42-d40e-4b54-9039-ea43b92a1263",
      "partner_role": "vendor",
      "partner_contribution": "Implementasi"
    }
  ],
  "success_metrics": [
    {
      "success_metric_value": "+60%",
      "success_metric_label": "Digital users",
      "sort_order": 1
    }
  ],
  "contract_number": "K-001/2026",
  "contract_name": "Kontrak Monitoring Bank Mandiri",
  "opportunity": "OPP-2026-014",
  "project_objective": "Memantau seluruh jaringan secara terpusat."
}'
```

## Success response

HTTP 201. JSON body:

```json
{
  "success": true,
  "message": "Project berhasil ditambahkan.",
  "data": {
    "id": "eb464f53-b4ee-4e6f-af8b-0cd1332b822d",
    "project_code": "ITMS_MON_BMRI_2026_PRO",
    "project_name": "Project ITMS_MON_BMRI_2026_PRO",
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
    "project_manager": "Budi",
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
    "updated_at": "2026-11-17T03:00:54.838878+00:00",
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

- The response contains the whole project (all perspectives), including the new `id`.
- Money fields (`value_before_tax`, `value_after_tax`, `carry_over_value`, `financial`) appear only for users with `financial.view`. A user who can write but cannot see money still saves the values, but they are not returned.
- `project_code` must be unique among projects that have not been deleted, case-insensitive. The code of a deleted project can be reused.
- Revenue is not stored separately: it always equals `value_before_tax`.

## Error responses

1. Duplicate `project_code` (HTTP 409):

```json
{
  "success": false,
  "message": "Project ID (project_code) sudah digunakan oleh project lain.",
  "error": {
    "code": "CONFLICT",
    "details": null
  }
}
```

2. Validation error — `end_date` not after `start_date` (HTTP 422):

```json
{
  "success": false,
  "message": "Validasi request gagal",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "type": "value_error",
        "loc": [
          "body"
        ],
        "msg": "Value error, end_date harus setelah start_date",
        "input": "<submitted value>",
        "ctx": {
          "error": "end_date harus setelah start_date"
        }
      }
    ]
  }
}
```

3. Validation error — missing required fields (HTTP 422, one entry per missing field; first two shown):

```json
{
  "success": false,
  "message": "Validasi request gagal",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "type": "missing",
        "loc": [
          "body",
          "project_code"
        ],
        "msg": "Field required",
        "input": "<submitted value>"
      },
      {
        "type": "missing",
        "loc": [
          "body",
          "year"
        ],
        "msg": "Field required",
        "input": "<submitted value>"
      }
    ]
  }
}
```

4. A master-data id does not exist (HTTP 422). `field` names the request field, `ids` lists the unknown ids:

```json
{
  "success": false,
  "message": "Ada data referensi yang tidak valid.",
  "error": {
    "code": "INVALID_REFERENCE",
    "details": [
      {
        "field": "product_ids",
        "ids": [
          "b0712187-9ffb-48ac-bf43-10e75953af1f"
        ],
        "reason": "tidak ditemukan"
      }
    ]
  }
}
```

5. Missing `Authorization` header (HTTP 403)::

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

6. Invalid or expired access token (HTTP 401)::

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

7. Authenticated, but the user's role does not have `portfolio.manage` (HTTP 403)::

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

## Field definitions

Top-level response fields:

- `success` (boolean) — `true` on success, `false` on error
- `message` (string) — short human-facing message (Bahasa Indonesia)
- `data` (object|array|null, success only) — payload described below
- `meta` (object|null, success only) — currently always `null`
- `error` (object, error responses only) — `code` (string) and `details` (array|object|null)

Project object (`data`):

- `id` (UUID) — project id
- `project_code`, `project_name` (string), `year` (integer), `is_featured` (boolean)
- `opportunity`, `contract_name`, `contract_number`, `project_manager`, `account_manager` (string|null)
- `business_unit`, `project_status` (object) — master data as `{id, code, name}`
- `start_date`, `end_date` (date)
- `total_days` (integer) — `end_date − start_date`
- `remaining_days` (integer) — `end_date − today (WIB)`, never below 0
- `progress_percent` (number) — `(today − start_date) / total_days`, clamped to 0–100
- `is_overdue` (boolean) — `true` only when status is `ON_GOING` and today is after `end_date`
- `project_objective`, `project_description`, `project_background`, `project_challenges`, `project_solution` (string|null)
- `customer` (object|null) — customer with `company_size`, `customer_type`, `industry`, `legal_structure` as `{id, code, name}` (or `null`)
- `tech_stack` (object) — `products`, `frontend`, `backend`, `data_storage`, each an array of `{id, name}`
- `partners` (array) — `{partner_id, partner_name, partner_role, partner_contribution}`
- `success_metrics` (array) — `{id, success_metric_value, success_metric_label, sort_order}`
- `files` (array) — file metadata (see the file endpoints)
- `created_at`, `updated_at` (datetime, UTC)

Money fields (only returned to users with permission `financial.view`; omitted entirely for other users):

- `value_before_tax` (number)
- `value_after_tax` (number) — `value_before_tax × (1 + PORTFOLIO_VAT_RATE)`, VAT rate default 11%
- `carry_over_value` (number|null)
- `financial` (object) — `revenue` (= `value_before_tax`), `cogs`, `operational_cost`, `net_profit` (= revenue − cogs − operational_cost), `net_margin_percent` (= net_profit / revenue × 100, `null` when revenue is 0), `value_after_tax`

