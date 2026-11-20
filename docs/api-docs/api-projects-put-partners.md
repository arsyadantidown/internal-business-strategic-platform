# API: Replace Project Partners (api-projects-put-partners)

Endpoint: `PUT /api/v1/projects/{project_id}/partners`

## Description

Replace the partners of a project. Each partner has a role in the project: `principal` or `vendor`. The submitted list becomes the complete list.

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
| `partners` | object[] | no | default `[]` |

Each item:

| Field | Type | Required | Rules |
|---|---|---|---|
| `partner_id` | UUID | yes | must exist in `partners` |
| `partner_role` | string | yes | `principal` or `vendor` (case-insensitive, stored lowercase) |
| `partner_contribution` | string | no | max 150 |


## Sample curl

```bash
curl --request PUT \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/partners' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
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
  ]
}'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Partner project berhasil disimpan.",
  "data": [
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
  "meta": null
}
```

Notes:

- A partner is identified by `(partner_id, partner_role)`. The same partner may appear with two different roles, but the same pair cannot appear twice (HTTP 422).
- When a pair already exists, only its `partner_contribution` is updated.
- An empty list removes all partners.
- Result is sorted by role, then partner name.

## Error responses

1. Invalid role (HTTP 422):

```json
{
  "success": false,
  "message": "Validasi request gagal",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "type": "literal_error",
        "loc": [
          "body",
          "partners",
          0,
          "partner_role"
        ],
        "msg": "Input should be 'principal' or 'vendor'",
        "input": "<submitted value>",
        "ctx": {
          "expected": "'principal' or 'vendor'"
        }
      }
    ]
  }
}
```

2. Unknown partner id (HTTP 422):

```json
{
  "success": false,
  "message": "Ada data referensi yang tidak valid.",
  "error": {
    "code": "INVALID_REFERENCE",
    "details": [
      {
        "field": "partners",
        "ids": [
          "<unknown-uuid>"
        ],
        "reason": "tidak ditemukan"
      }
    ]
  }
}
```

3. The same `(partner_id, partner_role)` twice: HTTP 422 `VALIDATION_ERROR`, message containing `Partner dengan peran yang sama tidak boleh dobel`.

4. Missing `Authorization` header (HTTP 403)::

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

5. Invalid or expired access token (HTTP 401)::

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

6. Authenticated, but the user's role does not have `portfolio.manage` (HTTP 403)::

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

7. Project not found or already deleted (HTTP 404)::

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

8. `project_id` is not a valid UUID: HTTP 422 with `error.code` = `VALIDATION_ERROR` (same shape as the validation example, `loc` = `["path", "project_id"]`).

## Field definitions

Top-level response fields:

- `success` (boolean) — `true` on success, `false` on error
- `message` (string) — short human-facing message (Bahasa Indonesia)
- `data` (object|array|null, success only) — payload described below
- `meta` (object|null, success only) — currently always `null`
- `error` (object, error responses only) — `code` (string) and `details` (array|object|null)

Response `data` (array):

- `partner_id` (UUID)
- `partner_name` (string)
- `partner_role` (string) — `principal` or `vendor`
- `partner_contribution` (string|null)

