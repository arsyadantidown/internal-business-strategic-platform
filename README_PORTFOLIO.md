# Modul Portfolio — bagian Backend Andrew

Revisi migration: `portfolio_0002_projects` (down_revision `portfolio_0001_master`).

## Isi
- **Model + migration**: projects, customers (1:1 per project), project_financials, project_products, project_tech_stacks, project_partners, project_success_metrics, project_files.
- **Permission** (`seed_portfolio_permissions.sql`): `portfolio.view`, `portfolio.manage`, `financial.view` + mapping role (usulan, perlu konfirmasi Arsyad). Dependency: `require_permission(...)`.
- **Schema bersama**: `ProjectCreate`, `ProjectRead`, `ProjectReadWithFinancial` (`app/api/projects/schema.py`).
- **Endpoint** (`/api/v1/projects`): `POST`, `PATCH /{id}`, `DELETE /{id}` (soft delete), `PUT /{id}/customer|financial|products|tech-stacks|partners|success-metrics`.
- **`create_project(db, payload, *, created_by)`** di `usecase.py`: tidak commit, bisa dipanggil ulang oleh import.
- **GCS + Project File API**: `app/core/gcs.py`; `POST /{id}/files`, `PATCH|DELETE /{id}/files/{file_id}`, `GET /{id}/files/{file_id}/download` (signed URL).

## Aturan penting
- Kolom uang (`value_before_tax`, `value_after_tax`, `carry_over_value`, `financial`) hanya dikembalikan ke user dengan `financial.view`.
- `project_code` unik tanpa membedakan huruf besar/kecil, hanya antar project yang belum dihapus.
- `end_date` harus setelah `start_date`. Nilai turunan (PPN, sisa hari, progress, net profit) dihitung saat dibaca; PPN dari `PORTFOLIO_VAT_RATE` (0.11).
- Upload file divalidasi magic bytes + batas ukuran per kategori; satu `case_study` (PDF) per project; bucket GCS privat.

## Konfigurasi baru (`settings.py` / env)
`GCS_BUCKET_NAME`, `GCS_CREDENTIALS_FILE`, `GCS_SIGNED_URL_TTL_SECONDS`, `PROJECT_FILE_MAX_{IMAGE,VIDEO,DOCUMENT,CASE_STUDY}_MB`, `PORTFOLIO_VAT_RATE`. Jangan commit file credentials.

## Menjalankan
```
alembic upgrade head
psql ... < seed_portfolio_permissions.sql   # setelah seed_roles_permissions.sql & seed_portfolio_master.sql
pip install -e ".[test]" && pytest         # butuh Postgres test (TEST_DATABASE_URL)
```
