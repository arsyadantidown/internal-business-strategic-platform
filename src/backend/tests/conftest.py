"""Test integrasi modul project: memakai Postgres sungguhan (bukan SQLite) karena memakai UUID,
indeks unik parsial dan constraint Postgres. Siapkan database kosong, lalu jalankan:

    TEST_DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/ibsp_test pytest

Redis dan Google Cloud Storage dipalsukan; database di-migrate dan di-seed otomatis di awal sesi."""

import asyncio
import os
import subprocess
import sys
import uuid
from datetime import datetime, timezone
from pathlib import Path

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+asyncpg://ibsp:ibsp@localhost:5432/ibsp_test"
)
# Harus di-set sebelum app diimpor, karena engine dibuat saat import.
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ.setdefault("APP_ENV", "development")

import asyncpg  # noqa: E402
import pytest  # noqa: E402
import pytest_asyncio  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

BACKEND_DIR = Path(__file__).resolve().parents[1]
REPO_ROOT = BACKEND_DIR.parents[1]
SEED_FILES = [
    "seed_divisions.sql",
    "seed_roles_permissions.sql",
    "seed_portfolio_permissions.sql",
    "seed_portfolio_master.sql",
]


async def _run_seeds() -> None:
    dsn = TEST_DATABASE_URL.replace("postgresql+asyncpg://", "postgresql://")
    connection = await asyncpg.connect(dsn)
    try:
        for name in SEED_FILES:
            await connection.execute((REPO_ROOT / name).read_text(encoding="utf-8"))
    finally:
        await connection.close()


@pytest.fixture(scope="session", autouse=True)
def database():
    env = {**os.environ, "DATABASE_URL": TEST_DATABASE_URL}
    subprocess.run(
        [sys.executable, "-m", "alembic", "upgrade", "head"],
        cwd=BACKEND_DIR,
        env=env,
        check=True,
    )
    asyncio.run(_run_seeds())


class FakeRedis:
    async def exists(self, *_args, **_kwargs):
        return 0


class FakeStorage:
    """Pengganti GCS di memori. Atur fail_upload / fail_delete untuk menguji jalur gagal."""

    def __init__(self):
        self.objects: dict[str, bytes] = {}
        self.fail_upload = False
        self.fail_delete = False

    async def upload(self, key, fileobj, content_type):
        from app.core.gcs import StorageError

        if self.fail_upload:
            raise StorageError("Upload file ke penyimpanan gagal.")
        fileobj.seek(0)
        self.objects[key] = fileobj.read()

    async def delete(self, key):
        from app.core.gcs import StorageError

        if self.fail_delete:
            raise StorageError("Hapus file di penyimpanan gagal.")
        self.objects.pop(key, None)

    async def signed_url(self, key, *, filename, content_type):
        return f"https://storage.example/{key}?signature=fake"


@pytest.fixture(scope="session")
def fake_storage():
    return FakeStorage()


@pytest_asyncio.fixture(scope="session")
async def app(fake_storage):
    from app.connections.redis import get_redis
    from app.core.gcs import get_storage
    from app.main import app as fastapi_app

    fastapi_app.dependency_overrides[get_redis] = lambda: FakeRedis()
    fastapi_app.dependency_overrides[get_storage] = lambda: fake_storage
    return fastapi_app


@pytest_asyncio.fixture
async def client(app):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as http:
        yield http


@pytest_asyncio.fixture
async def db():
    from app.connections.session import AsyncSessionLocal

    async with AsyncSessionLocal() as session:
        yield session


@pytest_asyncio.fixture(autouse=True)
async def clean_project_tables(database, fake_storage):
    from app.connections.session import AsyncSessionLocal

    fake_storage.objects.clear()
    fake_storage.fail_upload = False
    fake_storage.fail_delete = False

    async with AsyncSessionLocal() as session:
        await session.execute(
            text(
                "TRUNCATE "
                "project_files, project_success_metrics, project_partners, project_tech_stacks, "
                "project_products, project_financials, customers, projects CASCADE"
            )
        )
        await session.commit()
    yield


async def make_user(db, role_code: str | None) -> dict:
    from app.core.security import create_access_token
    from app.models.role_model import Role
    from app.models.user_model import User
    from sqlalchemy import select

    role_id = None
    if role_code:
        role_id = (await db.execute(select(Role.id).where(Role.code == role_code))).scalar_one()

    user = User(
        email=f"{uuid.uuid4().hex}@example.com",
        full_name="Tester",
        email_verified_at=datetime.now(timezone.utc),
        role_id=role_id,
        is_active=True,
    )
    db.add(user)
    await db.commit()
    token = create_access_token(str(user.id), user.token_version)
    return {"Authorization": f"Bearer {token}"}


# Mapping dari seed_portfolio_permissions.sql:
#   SUPER_ADMIN                    view + manage + financial.view
#   ENGINEER_PROJECT_LEAD          view + manage   (tanpa financial.view)
#   COMMERCIAL_PARTNERSHIP_OFFICER view + financial.view (tanpa manage)
@pytest_asyncio.fixture
async def admin(db):
    return await make_user(db, "SUPER_ADMIN")


@pytest_asyncio.fixture
async def engineer(db):
    return await make_user(db, "ENGINEER_PROJECT_LEAD")


@pytest_asyncio.fixture
async def commercial(db):
    return await make_user(db, "COMMERCIAL_PARTNERSHIP_OFFICER")


@pytest_asyncio.fixture
async def no_role(db):
    return await make_user(db, None)


@pytest_asyncio.fixture
async def refs(db) -> dict:
    """Id master data hasil seed, diakses lewat kode (string, siap dikirim sebagai JSON)."""
    from app.models.business_unit_model import BusinessUnit
    from app.models.company_size_model import CompanySize
    from app.models.customer_type_model import CustomerType
    from app.models.industry_model import Industry
    from app.models.legal_structure_model import LegalStructure
    from app.models.partner_model import Partner
    from app.models.product_model import Product
    from app.models.project_status_model import ProjectStatus
    from app.models.tech_stack_model import TechStack
    from sqlalchemy import select

    async def by_code(model, column):
        rows = (await db.execute(select(getattr(model, column), model.id))).all()
        return {code: str(item_id) for code, item_id in rows}

    suffix = uuid.uuid4().hex[:8]
    partners = {}
    for name in ("alpha", "beta"):
        partner = Partner(partner_name=f"Partner {name} {suffix}", is_active=True)
        db.add(partner)
        partners[name] = partner
    await db.commit()

    products = (await db.execute(select(Product.id).order_by(Product.product_name).limit(3))).scalars().all()
    stacks = (await db.execute(select(TechStack.id, TechStack.tech_stack_category))).all()
    tech = {}
    for item_id, category in stacks:
        tech.setdefault(category, []).append(str(item_id))

    return {
        "company_size": await by_code(CompanySize, "company_size_code"),
        "customer_type": await by_code(CustomerType, "customer_type_code"),
        "industry": await by_code(Industry, "industry_code"),
        "legal_structure": await by_code(LegalStructure, "legal_structure_code"),
        "business_unit": await by_code(BusinessUnit, "business_unit_code"),
        "status": await by_code(ProjectStatus, "project_status_code"),
        "partners": {key: str(p.id) for key, p in partners.items()},
        "products": [str(item) for item in products],
        "tech": tech,
    }
