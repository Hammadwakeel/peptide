from fastapi import APIRouter, Depends, Query

from middleware.auth import require_roles
from schemas.pagination import PaginationQuery
from schemas.products import AddToStoreRequest, UpdateStorePriceRequest
from services import clinic_catalog

router = APIRouter(prefix="/clinic", tags=["clinic-catalog"])
clinic_user = require_roles("clinic_owner", "clinic_staff")


@router.get("/inventory")
def master_inventory(
    pagination: PaginationQuery = Depends(),
    product_type: str | None = Query(None, pattern="^(ruo|pharmacy)$"),
    category_id: str | None = None,
    search: str | None = None,
    user: dict = Depends(clinic_user),
) -> dict:
    """Full master catalog — RUO / Pharmacy tabs (paginated). Shows clinic cost."""
    return clinic_catalog.list_master_inventory(user, pagination, product_type, category_id, search)


@router.get("/store/products")
def my_store(
    pagination: PaginationQuery = Depends(),
    search: str | None = Query(None),
    user: dict = Depends(clinic_user),
) -> dict:
    """Clinic's curated My Store — what patients will see (paginated)."""
    return clinic_catalog.list_my_store(user, pagination, search)


@router.post("/store/products")
def add_to_store(body: AddToStoreRequest, user: dict = Depends(clinic_user)) -> dict:
    """Add product from inventory to My Store with patient retail price."""
    return clinic_catalog.add_product_to_store(user, body)


@router.put("/store/products/{store_id}")
def update_store_price(
    store_id: str, body: UpdateStorePriceRequest, user: dict = Depends(clinic_user),
) -> dict:
    """Clinic sets / updates price to customer."""
    return clinic_catalog.update_store_product_price(user, store_id, body)


@router.delete("/store/products/{store_id}")
def remove_from_store(store_id: str, user: dict = Depends(clinic_user)) -> dict:
    return clinic_catalog.remove_store_product(user, store_id)


@router.delete("/store/products")
def remove_all(user: dict = Depends(clinic_user)) -> dict:
    """Remove all products from My Store."""
    return clinic_catalog.remove_all_store_products(user)
