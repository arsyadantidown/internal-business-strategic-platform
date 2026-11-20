# API: Replace Project Products (api-projects-put-products)

Endpoint: `PUT /api/v1/projects/{project_id}/products`

## Description

Replace the list of products used by a project. The submitted list becomes the complete list: products that are not in it are removed, new ones are added.

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
| `product_ids` | UUID[] | no | default `[]`; each id must exist in `products` |


## Sample curl

```bash
curl --request PUT \
  --url 'http://localhost:8000/api/v1/projects/eb464f53-b4ee-4e6f-af8b-0cd1332b822d/products' \
  --header 'Authorization: Bearer <ACCESS_TOKEN>' \
  --header 'Content-Type: application/json' \
  --data '{
  "product_ids": [
    "9f602c8b-53e7-4a2f-bf89-837f7c48e537",
    "144585a9-114e-41d3-a9c5-436ee7eb8f89"
  ]
}'
```

## Success response

HTTP 200. JSON body:

```json
{
  "success": true,
  "message": "Product project berhasil disimpan.",
  "data": {
    "products": [
      {
        "id": "9f602c8b-53e7-4a2f-bf89-837f7c48e537",
        "name": "Bliv AI"
      },
      {
        "id": "144585a9-114e-41d3-a9c5-436ee7eb8f89",
        "name": "Bliv Dashboard"
      }
    ]
  },
  "meta": null
}
```

Notes:

- An empty list removes all products from the project.
- Duplicate ids in the list are treated as one.
- Products that are already attached stay valid even if the master record has since been deactivated.

## Error responses

1. Unknown product id (HTTP 422):

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

- `products` (array) — `{id, name}`, sorted by name

