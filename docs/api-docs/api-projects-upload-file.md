# API: Upload Project File (api-projects-upload-file)

Endpoint: `POST /api/v1/projects/{project_id}/files`

## Description

Upload a file (image, video, document or case study) for a project. The file is stored in a private Google Cloud Storage bucket; only its metadata is kept in the database.

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
- `Content-Type: multipart/form-data` (set automatically by curl `-F` / Swagger UI)

Body (`multipart/form-data`):

| Field | Type | Required | Rules |
|---|---|---|---|
| `file` | file | yes | the file to upload |
| `file_category` | string | yes | `image`, `video`, `document` or `case_study` |
| `file_title` | string | no | max 255 |
| `file_description` | string | no | free text |
| `sort_order` | integer | no | 0–32767, default `0` |

Allowed types and size limits (the type is detected from the file content, not from the file name or the `Content-Type` sent by the client):

| Category | Allowed types | Max size |
|---|---|---|
| `image` | JPEG, PNG, WebP | 10 MB |
| `video` | MP4, WebM | 200 MB |
| `document` | PDF, DOCX, PPTX, XLSX | 25 MB |
| `case_study` | PDF | 50 MB |


## Sample curl

```bash
curl --request POST \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/files' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --form 'file=@case-study-bmri.pdf;type=application/pdf' \
  --form 'file_category=case_study' \
  --form 'file_title=Case Study Bank Mandiri' \
  --form 'file_description=Studi kasus implementasi monitoring.' \
  --form 'sort_order=1'
```

## Success response

HTTP 201. JSON body:

```json
{
  "success": true,
  "message": "File project berhasil diunggah.",
  "data": {
    "id": "7df31a44-8a2f-4ca6-bbbb-b892eb1a8f26",
    "project_id": "eb464f53-b4ee-4e6f-af8b-0cd1332b822d",
    "file_category": "case_study",
    "file_name": "case-study-bmri.pdf",
    "file_title": "Case Study Bank Mandiri",
    "file_description": "Studi kasus implementasi monitoring.",
    "mime_type": "application/pdf",
    "file_size_bytes": 45,
    "sort_order": 1,
    "created_at": "2026-11-17T03:00:55.225156+00:00"
  },
  "meta": null
}
```

Notes:

- `storage_key` (the object path inside the bucket) is never returned.
- A project can have only **one** `case_study`. Delete the old one before uploading a new one.
- If a `Content-Type` is sent by the client it must match the detected type (`application/octet-stream` is accepted).
- The file is uploaded to the bucket first and the database row is saved afterwards. If saving the row fails, the uploaded object is deleted again, so no orphan file remains.
- Size limits are configurable through `PROJECT_FILE_MAX_{IMAGE,VIDEO,DOCUMENT,CASE_STUDY}_MB`.

## Error responses

1. Second case study for the same project (HTTP 409):

```json
{
  "success": false,
  "message": "Project ini sudah punya case study. Hapus yang lama sebelum mengunggah yang baru.",
  "error": {
    "code": "CONFLICT",
    "details": null
  }
}
```

2. File content does not match the category (HTTP 422):

```json
{
  "success": false,
  "message": "Tipe file tidak diizinkan untuk kategori document. Diizinkan: application/pdf, application/vnd.openxmlformats-officedocument.presentationml.presentation, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.openxmlformats-officedocument.wordprocessingml.document.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": null
  }
}
```

3. File too large (HTTP 413):

```json
{
  "success": false,
  "message": "Ukuran file melebihi batas 10 MB untuk kategori image.",
  "error": {
    "code": "HTTP_ERROR",
    "details": null
  }
}
```

4. Invalid `file_category` (HTTP 422):

```json
{
  "success": false,
  "message": "file_category harus salah satu dari: image, video, document, case_study.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": null
  }
}
```

5. Storage (GCS) unavailable (HTTP 502):

```json
{
  "success": false,
  "message": "Upload file ke penyimpanan gagal.",
  "error": {
    "code": "HTTP_ERROR",
    "details": null
  }
}
```

6. Empty file: HTTP 422, message `File kosong.`

7. `Content-Type` does not match the file content: HTTP 422, message `Content-Type tidak cocok dengan isi file.`

8. `sort_order` outside 0–32767: HTTP 422.

9. Missing `Authorization` header (HTTP 403)::

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

10. Invalid or expired access token (HTTP 401)::

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

11. Authenticated, but the user's role does not have `portfolio.manage` (HTTP 403)::

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

12. Project not found or already deleted (HTTP 404)::

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

13. `project_id` is not a valid UUID: HTTP 422 with `error.code` = `VALIDATION_ERROR` (same shape as the validation example, `loc` = `["path", "project_id"]`).

## Field definitions

Top-level response fields:

- `success` (boolean) — `true` on success, `false` on error
- `message` (string) — short human-facing message (Bahasa Indonesia)
- `data` (object|array|null, success only) — payload described below
- `meta` (object|null, success only) — currently always `null`
- `error` (object, error responses only) — `code` (string) and `details` (array|object|null)

Response `data`:

- `id` (UUID) — file id
- `project_id` (UUID)
- `file_category` (string) — `image`, `video`, `document` or `case_study`
- `file_name` (string) — original file name (folder path stripped)
- `file_title` (string|null), `file_description` (string|null)
- `mime_type` (string) — detected type
- `file_size_bytes` (integer)
- `sort_order` (integer)
- `created_at` (datetime, UTC)

