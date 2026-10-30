from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.auth.permissions import require_permission
from app.api.customers.repository import CustomerRepository
from app.api.customers.schema import CustomerSearch
from app.api.customers.usecase import CustomerUseCase
from app.connections.session import get_db
from app.core.responses import success_response
from app.models.user_model import User

router = APIRouter(prefix="/customers", tags=["Customers"])

def get_customer_use_case(
    db: AsyncSession = Depends(get_db),
) -> CustomerUseCase:
    return CustomerUseCase(CustomerRepository(db))

@router.get("/names")
async def get_customer_names(
    search: CustomerSearch | None = Query(default=None),
    _: User = Depends(require_permission("portfolio.view")),
    use_case: CustomerUseCase = Depends(get_customer_use_case),
):
    """Nama customer tanpa duplikat dari project yang belum dihapus, untuk filter Customer
    dan autocomplete form. Beda huruf besar/kecil dan spasi dianggap sama; yang ditampilkan
    penulisan yang paling sering dipakai."""
    data = await use_case.list_names(search)
    return success_response(message="Data nama customer berhasil diambil.", data=data)

@router.get("/locations")
async def get_customer_locations(
    _: User = Depends(require_permission("portfolio.view")),
    use_case: CustomerUseCase = Depends(get_customer_use_case),
):
    """Lokasi customer yang sudah ada (tanpa duplikat) dari project yang belum dihapus,
    untuk filter Location."""
    data = await use_case.list_locations()
    return success_response(message="Data lokasi customer berhasil diambil.", data=data)
