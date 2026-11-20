# API: Download Project File (api-projects-download-file)

Endpoint: `GET /api/v1/projects/{project_id}/files/{file_id}/download`

## Description

Create a short-lived signed URL to download a file straight from the private storage bucket. The API itself does not stream the file.

## Authentication

Bearer token (JWT) expected in the `Authorization` header. The user's role must have the permission `portfolio.view`.

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
curl --request GET \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/files/7df31a44-8a2f-4ca6-bbbb-b892eb1a8f26/download' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Link unduhan berhasil dibuat.",
  "data": {
    "download_url": "https://storage.example/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/case_study/816b1ec8-a67d-40fe-8cfe-cf66b37fb7ca.pdf?signature=fake",
    "expires_in_seconds": 300,
    "file_name": "case-study-bmri.pdf",
    "mime_type": "application/pdf",
    "file_size_bytes": 45
  },
  "meta": null
}
```

Notes:

- Open `data.download_url` in a browser (or GET it) before it expires. The default lifetime is 300 seconds (`GCS_SIGNED_URL_TTL_SECONDS`); after that request a new link.
- The URL forces a download with the original file name and the stored content type.
- The URL shown here is a placeholder from the test environment; in a real deployment it points to `storage.googleapis.com`.
- This endpoint needs `portfolio.view` (not `portfolio.manage`).

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

3. Storage (GCS) could not create the link (HTTP 502):

```json
{
  "success": false,
  "message": "Membuat link unduhan gagal.",
  "error": {
    "code": "HTTP_ERROR",
    "details": null
  }
}
```

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

6. Authenticated, but the user's role does not have `portfolio.view` (HTTP 403)::

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

Response `data`:

- `download_url` (string) — signed URL (HTTP GET, no extra headers needed)
- `expires_in_seconds` (integer) — lifetime of the URL
- `file_name` (string), `mime_type` (string), `file_size_bytes` (integer)

