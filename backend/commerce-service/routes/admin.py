from fastapi import APIRouter, Depends, Query

from middleware.auth import require_roles
from schemas.pagination import PaginationQuery
from schemas.products import CreateProductRequest, UpdateProductRequest
from services import admin_inventory

router = APIRouter(prefix="/admin", tags=["admin-inventory"])
admin_user = require_roles("admin", "super_admin")


@router.post("/products")
def create_product(body: CreateProductRequest, _: dict = Depends(admin_user)) -> dict:
    """Admin adds product to master inventory."""
    return admin_inventory.create_inventory(body)


@router.get("/products")
def list_products(
    pagination: PaginationQuery = Depends(),
    product_type: str | None = Query(None, pattern="^(ruo|pharmacy)$"),
    category_id: str | None = None,
    search: str | None = None,
    _: dict = Depends(admin_user),
) -> dict:
    """Admin lists master inventory (paginated)."""
    return admin_inventory.list_inventory(pagination, product_type, category_id, search)


@router.get("/products/{product_id}")
def get_product(product_id: str, _: dict = Depends(admin_user)) -> dict:
    return admin_inventory.get_inventory_product(product_id)


@router.put("/products/{product_id}")
def update_product(
    product_id: str, body: UpdateProductRequest, _: dict = Depends(admin_user),
) -> dict:
    return admin_inventory.update_inventory(product_id, body)


@router.delete("/products/{product_id}")
def delete_product(product_id: str, _: dict = Depends(admin_user)) -> dict:
    return admin_inventory.deactivate_product(product_id)


@router.get("/categories")
def categories(_: dict = Depends(admin_user)) -> dict:
    return admin_inventory.get_categories()
