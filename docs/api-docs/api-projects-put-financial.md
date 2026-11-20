# API: Replace Project Financial (api-projects-put-financial)

Endpoint: `PUT /api/v1/projects/{project_id}/financial`

## Description

Set the cost figures of a project (cost of goods sold and operational cost). Revenue is not entered: it always equals the project's `value_before_tax`.

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

Body (JSON):

| Field | Type | Required | Rules |
|---|---|---|---|
| `cogs` | decimal | no | ≥ 0, max 2 decimals, default `0` |
| `operational_cost` | decimal | no | ≥ 0, max 2 decimals, default `0` |


## Sample curl

```bash
curl --request PUT \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/financial' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
  "cogs": "200000",
  "operational_cost": "100000"
}'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Data keuangan project berhasil disimpan.",
  "data": {
    "revenue": 1000000.0,
    "cogs": 200000.0,
    "operational_cost": 100000.0,
    "net_profit": 700000.0,
    "net_margin_percent": 70.0,
    "value_after_tax": 1110000.0
  },
  "meta": null
}
```

Notes:

- Full replacement: a field that is not sent is reset to `0`.
- The user may write without being allowed to read: for users **without** `financial.view`, the values are saved but `data` is `null`:

```json
{
  "success": true,
  "message": "Data keuangan project berhasil disimpan.",
  "data": null,
  "meta": null
}
```
- Derived values are computed on read, not stored.

## Error responses

1. Negative or non-numeric value: HTTP 422 `VALIDATION_ERROR`.

2. Missing `Authorization` header (HTTP 403)::

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

3. Invalid or expired access token (HTTP 401)::

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

4. Authenticated, but the user's role does not have `portfolio.manage` (HTTP 403)::

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

5. Project not found or already deleted (HTTP 404)::

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

6. `project_id` is not a valid UUID: HTTP 422 with `error.code` = `VALIDATION_ERROR` (same shape as the validation example, `loc` = `["path", "project_id"]`).

## Field definitions

Top-level response fields:

- `success` (boolean) — `true` on success, `false` on error
- `message` (string) — short human-facing message (Bahasa Indonesia)
- `data` (object|array|null, success only) — payload described below
- `meta` (object|null, success only) — currently always `null`
- `error` (object, error responses only) — `code` (string) and `details` (array|object|null)

Response `data` (only with `financial.view`, otherwise `null`):

- `revenue` (number) — equals the project's `value_before_tax`
- `cogs` (number), `operational_cost` (number)
- `net_profit` (number) — `revenue − cogs − operational_cost`
- `net_margin_percent` (number|null) — `net_profit / revenue × 100`, `null` when revenue is 0
- `value_after_tax` (number) — `value_before_tax × (1 + PORTFOLIO_VAT_RATE)`, default VAT 11%

