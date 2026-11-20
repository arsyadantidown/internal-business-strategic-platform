# API: Replace Project Tech Stacks (api-projects-put-tech-stacks)

Endpoint: `PUT /api/v1/projects/{project_id}/tech-stacks`

## Description

Replace the tech stacks used by a project. The submitted list becomes the complete list. The response groups them by category.

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
| `tech_stack_ids` | UUID[] | no | default `[]`; each id must exist in `tech_stacks` |


## Sample curl

```bash
curl --request PUT \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/tech-stacks' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
  "tech_stack_ids": [
    "1650a991-68a0-49e5-a396-1526a333e8bf",
    "707dfc23-6b3f-48c4-aaf3-4226f7553662",
    "e7988eca-bbcd-4e4b-96e9-860df72ae90e"
  ]
}'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Tech stack project berhasil disimpan.",
  "data": {
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
    "data_storage": [
      {
        "id": "e7988eca-bbcd-4e4b-96e9-860df72ae90e",
        "name": "PostgreSQL (Postgres)"
      }
    ]
  },
  "meta": null
}
```

Notes:

- The category of each tech stack comes from the master data; you only send ids.
- An empty list removes all tech stacks.
- Duplicate ids are treated as one.

## Error responses

1. Unknown tech stack id (HTTP 422):

```json
{
  "success": false,
  "message": "Ada data referensi yang tidak valid.",
  "error": {
    "code": "INVALID_REFERENCE",
    "details": [
      {
        "field": "tech_stack_ids",
        "ids": [
          "<unknown-uuid>"
        ],
        "reason": "tidak ditemukan"
      }
    ]
  }
}
```

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

Response `data`:

- `frontend` (array) — `{id, name}`
- `backend` (array) — `{id, name}`
- `data_storage` (array) — `{id, name}`

Each array is sorted by name; a category without items is an empty array.

