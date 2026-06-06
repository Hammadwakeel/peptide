from fastapi import APIRouter, Depends, Query

from middleware.auth import require_roles
from schemas.pagination import PaginationQuery
from services import patient_storefront

router = APIRouter(prefix="/patient", tags=["patient-storefront"])
patient_user = require_roles("patient")


@router.get("/store/products")
def browse_products(
    pagination: PaginationQuery = Depends(),
    search: str | None = Query(None),
    user: dict = Depends(patient_user),
) -> dict:
    """Patient sees only their clinic's visible storefront products (paginated)."""
    return patient_storefront.list_patient_products(user, pagination, search)


@router.get("/store/products/{store_id}")
def product_detail(store_id: str, user: dict = Depends(patient_user)) -> dict:
    """Patient product detail — retail price only, no clinic cost."""
    return patient_storefront.get_patient_product(user, store_id)
