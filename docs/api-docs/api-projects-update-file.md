# API: Update Project File (api-projects-update-file)

Endpoint: `PATCH /api/v1/projects/{project_id}/files/{file_id}`

## Description

Update the metadata of an uploaded file (title, description, order). The file itself is not changed; to replace it, delete it and upload a new one.

## Authentication

Bearer token (JWT) expected in the `Authorization` header. The user's role must have the permission `portfolio.manage`.

## Base URL

All examples use the local development URL. Replace with your environment (staging / production URLs to be filled in by the team).

`http://localhost:8000`

## Request

Path parameters:

- `project_id` (UUID, required) — id of the project.
- `file_id` (UUID, required) — id of the file (`data.id` from the upload response).

Headers:

- `Authorization: Bearer <ACCESS_TOKEN>` — access token from `POST /api/v1/auth/login`. Do not share real tokens in public docs.
- `Content-Type: application/json`

Body (JSON), all optional but at least one is required:

| Field | Type | Rules |
|---|---|---|
| `file_title` | string\|null | max 255; `null` or empty clears it |
| `file_description` | string\|null | free text; `null` or empty clears it |
| `sort_order` | integer | 0–32767, cannot be `null` |


## Sample curl

```bash
curl --request PATCH \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/files/7df31a44-8a2f-4ca6-bbbb-b892eb1a8f26' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
  "file_title": "Case Study BMRI (final)",
  "sort_order": 2
}'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Data file project berhasil diperbarui.",
  "data": {
    "id": "7df31a44-8a2f-4ca6-bbbb-b892eb1a8f26",
    "project_id": "eb464f53-b4ee-4e6f-af8b-0cd1332b822d",
    "file_category": "case_study",
    "file_name": "case-study-bmri.pdf",
    "file_title": "Case Study BMRI (final)",
    "file_description": "Studi kasus implementasi monitoring.",
    "mime_type": "application/pdf",
    "file_size_bytes": 45,
    "sort_order": 2,
    "created_at": "2026-11-17T03:00:55.225156+00:00"
  },
  "meta": null
}
```

Notes:

- Only the fields present in the body change.
- An empty body (`{}`) is rejected with HTTP 400.

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

2. File not found, or it belongs to another project (HTTP 404):

```json
{
  "success": false,
  "message": "File tidak ditemukan.",
  "error": {
    "code": "NOT_FOUND",
    "details": null
  }
}
```

3. Project not found or deleted: HTTP 404, message `Project tidak ditemukan.`

4. `sort_order` is `null` or out of range: HTTP 422.

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

Response `data` has the same fields as the upload response (see `api-projects-upload-file.md`).

