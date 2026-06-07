from fastapi import APIRouter, Depends, Query

from middleware.auth import require_roles
from schemas.inventory_clinic import AddToStoreRequest, SetRetailPriceRequest, UpdateStorePriceRequest
from schemas.pagination import PaginationQuery
from services import clinic_catalog

router = APIRouter(prefix="/provider", tags=["inventory-clinic"])
provider_user = require_roles("clinic_owner", "clinic_staff")


@router.get("/catalog")
def browse_catalog(
    pagination: PaginationQuery = Depends(),
    product_type: str | None = Query(None, pattern="^(ruo|pharmacy)$"),
    category_id: str | None = None,
    search: str | None = None,
    stock_status: str | None = Query(None, pattern="^(in_stock|low|out_of_stock)$"),
    user: dict = Depends(provider_user),
) -> dict:
    """M3.11 — Provider browses master catalog with clinic cost."""
    return clinic_catalog.list_provider_catalog(
        user, pagination, product_type, category_id, search, stock_status,
    )


@router.get("/catalog/{slug}")
def catalog_product_detail(slug: str, user: dict = Depends(provider_user)) -> dict:
    """M3.12 — Provider product detail by slug."""
    return clinic_catalog.get_provider_catalog_product(user, slug)


@router.patch("/catalog/{product_id}/retail-price")
def set_retail_price(
    product_id: str,
    body: SetRetailPriceRequest,
    user: dict = Depends(provider_user),
) -> dict:
    """M3.13 — Set patient-facing retail price (adds/updates in My Store)."""
    return clinic_catalog.set_retail_price(user, product_id, body)


@router.get("/store/products")
def my_store(
    pagination: PaginationQuery = Depends(),
    search: str | None = Query(None),
    user: dict = Depends(provider_user),
) -> dict:
    """M4.5 — Clinic curated My Store products."""
    return clinic_catalog.list_my_store(user, pagination, search)


@router.post("/store/products")
def add_to_store(body: AddToStoreRequest, user: dict = Depends(provider_user)) -> dict:
    """M4.2 — Add product to My Store."""
    return clinic_catalog.add_product_to_store(user, body)


@router.delete("/store/products/all")
def remove_all(user: dict = Depends(provider_user)) -> dict:
    """M4.4 — Remove all products from My Store."""
    return clinic_catalog.remove_all_store_products(user)


@router.put("/store/products/{store_id}")
def update_store_price(
    store_id: str,
    body: UpdateStorePriceRequest,
    user: dict = Depends(provider_user),
) -> dict:
    return clinic_catalog.update_store_product_price(user, store_id, body)


@router.delete("/store/products/{store_id}")
def remove_from_store(store_id: str, user: dict = Depends(provider_user)) -> dict:
    """M4.3 — Remove product from My Store."""
    return clinic_catalog.remove_store_product(user, store_id)
