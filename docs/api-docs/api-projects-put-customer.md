# API: Replace Project Customer (api-projects-put-customer)

Endpoint: `PUT /api/v1/projects/{project_id}/customer`

## Description

Replace the customer of a project. Each project has exactly one customer (1:1). Optional fields that are not sent become `null`.

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

Body (JSON): Customer object.

| Field | Type | Required | Rules |
|---|---|---|---|
| `customer_name` | string | yes | max 255 |
| `customer_location` | string | no | max 255 |
| `annual_revenue` | string | no | max 100, free text |
| `company_size_id` | UUID | no | must exist in `company_sizes` |
| `customer_type_id` | UUID | no | must exist in `customer_types` |
| `industry_id` | UUID | no | must exist in `industries` |
| `legal_structure_id` | UUID | no | must exist in `legal_structures` |


## Sample curl

```bash
curl --request PUT \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/customer' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
  "customer_name": "PT Bank Mandiri (Persero) Tbk",
  "customer_location": "Jakarta Selatan",
  "annual_revenue": "115T (FY 2025)",
  "company_size_id": "d6d1012a-90c5-4df1-a4d7-680aa215fc08",
  "customer_type_id": "e24de79f-2b07-4b56-8043-472c3086132b",
  "industry_id": "34dd5d8a-5d96-452a-acee-acfc0640958d",
  "legal_structure_id": "a3ff1961-9ffb-496a-b362-3c442742f31e"
}'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Customer project berhasil disimpan.",
  "data": {
    "id": "cb3f49ef-7302-40a5-960e-424e023c43dd",
    "customer_name": "PT Bank Mandiri (Persero) Tbk",
    "customer_location": "Jakarta Selatan",
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
  "meta": null
}
```

Notes:

- It is a full replacement (PUT): fields omitted from the body are set to `null`, not kept.
- The customer row keeps the same `id` when it is replaced.
- If the project had no customer, one is created.

## Error responses

1. Unknown master-data id (HTTP 422):

```json
{
  "success": false,
  "message": "Ada data referensi yang tidak valid.",
  "error": {
    "code": "INVALID_REFERENCE",
    "details": [
      {
        "field": "customer.industry_id",
        "ids": [
          "<unknown-uuid>"
        ],
        "reason": "tidak ditemukan"
      }
    ]
  }
}
```

2. `customer_name` missing or empty: HTTP 422 `VALIDATION_ERROR`.

3. Missing `Authorization` header (HTTP 403)::

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

4. Invalid or expired access token (HTTP 401)::

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

5. Authenticated, but the user's role does not have `portfolio.manage` (HTTP 403)::

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

6. Project not found or already deleted (HTTP 404)::

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

7. `project_id` is not a valid UUID: HTTP 422 with `error.code` = `VALIDATION_ERROR` (same shape as the validation example, `loc` = `["path", "project_id"]`).

## Field definitions

Top-level response fields:

- `success` (boolean) — `true` on success, `false` on error
- `message` (string) — short human-facing message (Bahasa Indonesia)
- `data` (object|array|null, success only) — payload described below
- `meta` (object|null, success only) — currently always `null`
- `error` (object, error responses only) — `code` (string) and `details` (array|object|null)

Response `data`:

- `id` (UUID) — customer id
- `customer_name` (string), `customer_location` (string|null), `annual_revenue` (string|null)
- `company_size`, `customer_type`, `industry`, `legal_structure` (object|null) — master data as `{id, code, name}`

