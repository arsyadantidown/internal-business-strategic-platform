# API: Delete Project File (api-projects-delete-file)

Endpoint: `DELETE /api/v1/projects/{project_id}/files/{file_id}`

## Description

Permanently delete an uploaded file: its database row and the object in the storage bucket.

## Authentication

Bearer token (JWT) expected in the `Authorization` header. The user's role must have the permission `portfolio.manage`.

## Base URL

All examples use the local development URL. Replace with your environment (staging / production URLs to be filled in by the team).

`http://localhost:8000`

## Request

Path parameters:

- `project_id` (UUID, required) — id of the project.
- `file_id` (UUID, required) — id of the file.

Headers:

- `Authorization: Bearer <ACCESS_TOKEN>` — access token from `POST /api/v1/auth/login`. Do not share real tokens in public docs.


## Sample curl

```bash
curl --request DELETE \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/files/7df31a44-8a2f-4ca6-bbbb-b892eb1a8f26' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "File project berhasil dihapus.",
  "data": null,
  "meta": null
}
```

Notes:

- This is a hard delete (unlike deleting a project). The slot of a deleted `case_study` is free again.
- The database row is deleted first, then the object in the bucket. If the bucket delete fails the request still succeeds (the leftover object is invisible to users and is logged for manual cleanup).

## Error responses

1. File not found (HTTP 404):

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

2. Project not found or deleted: HTTP 404, message `Project tidak ditemukan.`

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

## Field definitions

Top-level response fields:

- `success` (boolean) — `true` on success, `false` on error
- `message` (string) — short human-facing message (Bahasa Indonesia)
- `data` (object|array|null, success only) — payload described below
- `meta` (object|null, success only) — currently always `null`
- `error` (object, error responses only) — `code` (string) and `details` (array|object|null)

No additional fields. `data` is `null`.

