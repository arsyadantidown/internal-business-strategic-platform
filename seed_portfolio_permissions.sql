-- Permission modul Portfolio. Dipakai oleh require_permission(...) di /partners, /products, /tech-stacks,
-- /master-data dan /projects, serta untuk menyembunyikan angka keuangan project.
--
--   portfolio.view   melihat portofolio, master data portofolio, dan mengunduh file project
--   portfolio.manage menambah, mengubah, menghapus project, perspektifnya, dan file-nya, serta master data
--   financial.view   melihat angka keuangan (value before/after tax, carry over, revenue, COGS, biaya
--                    operasional, net profit). Tanpa ini, field tersebut tidak muncul di response.
--
-- ASUMSI mapping role di bawah, BELUM dikonfirmasi dengan Arsyad. Ubah bagian VALUES di bawah bila berbeda.
-- Jalankan setelah seed_roles_permissions.sql. Aman dijalankan berulang.
BEGIN;

INSERT INTO permissions (id, code, name, description)
VALUES
    (gen_random_uuid(), 'portfolio.view', 'View Portfolio',
     'Melihat portofolio, master data portofolio, dan mengunduh file project.'),
    (gen_random_uuid(), 'portfolio.manage', 'Manage Portfolio',
     'Menambah, mengubah, dan menghapus project, perspektifnya, file project, serta master data portofolio.'),
    (gen_random_uuid(), 'financial.view', 'View Financial Data',
     'Melihat angka keuangan project: nilai kontrak, carry over, revenue, COGS, biaya operasional, net profit.')
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM (
    VALUES
        ('SUPER_ADMIN',                    'portfolio.view'),
        ('COMMERCIAL_PARTNERSHIP_OFFICER', 'portfolio.view'),
        ('ENGINEER_PROJECT_LEAD',          'portfolio.view'),
        ('SUPER_ADMIN',                    'portfolio.manage'),
        ('ENGINEER_PROJECT_LEAD',          'portfolio.manage'),
        ('SUPER_ADMIN',                    'financial.view'),
        ('COMMERCIAL_PARTNERSHIP_OFFICER', 'financial.view')
) AS mapping (role_code, permission_code)
JOIN roles r ON r.code = mapping.role_code
JOIN permissions p ON p.code = mapping.permission_code
ON CONFLICT (role_id, permission_id) DO NOTHING;

COMMIT;
