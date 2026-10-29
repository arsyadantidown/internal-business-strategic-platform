from app.api.customers.repository import CustomerRepository

class CustomerUseCase:
    def __init__(self, repository: CustomerRepository):
        self.repository = repository

    async def list_names(self, search: str | None = None):
        names = await self.repository.get_names(search or None)
        return [{"customer_name": name} for name in names]

    async def list_locations(self):
        locations = await self.repository.get_locations()
        return [{"customer_location": location} for location in locations]
