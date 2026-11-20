# API: Replace Project Success Metrics (api-projects-put-success-metrics)

Endpoint: `PUT /api/v1/projects/{project_id}/success-metrics`

## Description

Replace the success metrics (headline results such as `+60%` Digital users) of a project. The submitted list becomes the complete list.

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
| `success_metrics` | object[] | no | default `[]`, max 20 items |

Each item:

| Field | Type | Required | Rules |
|---|---|---|---|
| `success_metric_value` | string | yes | max 50 (e.g. `"+60%"`) |
| `success_metric_label` | string | yes | max 150 |
| `sort_order` | integer | no | 0–32767, default `0` |


## Sample curl

```bash
curl --request PUT \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/success-metrics' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
  "success_metrics": [
    {
      "success_metric_value": "+60%",
      "success_metric_label": "Digital users",
      "sort_order": 1
    },
    {
      "success_metric_value": "-40%",
      "success_metric_label": "Biaya operasional",
      "sort_order": 2
    }
  ]
}'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Success metrics project berhasil disimpan.",
  "data": [
    {
      "id": "f05ed9a3-6ddc-4431-8ce4-9bb206d7bbb1",
      "success_metric_value": "+60%",
      "success_metric_label": "Digital users",
      "sort_order": 1
    },
    {
      "id": "cf677d33-1bd1-4dac-8772-a4de6dc8fa89",
      "success_metric_value": "-40%",
      "success_metric_label": "Biaya operasional",
      "sort_order": 2
    }
  ],
  "meta": null
}
```

Notes:

- The whole list is replaced on every call, so the `id` of each metric changes. Do not store metric ids on the client.
- Result is sorted by `sort_order`, then label.
- An empty list removes all metrics.

## Error responses

1. More than 20 items, empty `success_metric_value` / `success_metric_label`, or `sort_order` out of range: HTTP 422 `VALIDATION_ERROR`.

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

Response `data` (array):

- `id` (UUID)
- `success_metric_value` (string)
- `success_metric_label` (string)
- `sort_order` (integer)

