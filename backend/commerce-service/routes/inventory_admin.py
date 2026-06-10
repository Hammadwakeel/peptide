from decimal import Decimal

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile

from middleware.auth import require_roles
from schemas.inventory_admin import (
    CreateCategoryRequest,
    CreateProductRequest,
    UpdateProductRequest,
    UpdateStockRequest,
)
from schemas.pagination import PaginationQuery
from services import admin_inventory

router = APIRouter(prefix="/admin", tags=["inventory-admin"])
admin_user = require_roles("admin", "super_admin")


@router.post("/products")
async def create_product(
    sku: str = Form(..., min_length=2, max_length=100),
    product_name: str = Form(..., min_length=2),
    category_id: str | None = Form(None),
    product_type: str = Form("peptides"),
    description: str | None = Form(None),
    directions: str | None = Form(None),
    stock_count: int = Form(0),
    low_stock_threshold: int = Form(10),
    clinic_cost: Decimal = Form(...),
    strength: str | None = Form(None),
    form: str | None = Form(None),
    best_use_within: str | None = Form(None),
    dea_schedule: str | None = Form(None),
    image: UploadFile | None = File(None),
    _: dict = Depends(admin_user),
) -> dict:
    """Create a peptides or pharmacy catalog product."""
    body = CreateProductRequest(
        sku=sku,
        product_name=product_name,
        category_id=category_id,
        product_type=product_type,
        description=description,
        directions=directions,
        stock_count=stock_count,
        low_stock_threshold=low_stock_threshold,
        clinic_cost=clinic_cost,
        strength=strength,
        form=form,
        best_use_within=best_use_within,
        dea_schedule=dea_schedule,
    )
    return await admin_inventory.create_inventory(body, image=image)


@router.get("/products")
def list_products(
    pagination: PaginationQuery = Depends(),
    product_type: str | None = Query(None, pattern="^(peptides|pharmacy)$"),
    category_id: str | None = None,
    search: str | None = None,
    stock_status: str | None = Query(None, pattern="^(in_stock|low|out_of_stock)$"),
    _: dict = Depends(admin_user),
) -> dict:
    """Admin lists master catalog (paginated, filterable by peptides or pharmacy)."""
    return admin_inventory.list_inventory(
        pagination, product_type, category_id, search, stock_status,
    )


@router.get("/products/{product_id}")
def get_product(product_id: str, _: dict = Depends(admin_user)) -> dict:
    return admin_inventory.get_inventory_product(product_id)


@router.put("/products/{product_id}")
async def update_product(
    product_id: str,
    product_name: str | None = Form(None),
    category_id: str | None = Form(None),
    description: str | None = Form(None),
    directions: str | None = Form(None),
    stock_count: int | None = Form(None),
    low_stock_threshold: int | None = Form(None),
    clinic_cost: Decimal | None = Form(None),
    active: bool | None = Form(None),
    strength: str | None = Form(None),
    form: str | None = Form(None),
    best_use_within: str | None = Form(None),
    dea_schedule: str | None = Form(None),
    image: UploadFile | None = File(None),
    _: dict = Depends(admin_user),
) -> dict:
    body = UpdateProductRequest(
        product_name=product_name,
        category_id=category_id,
        description=description,
        directions=directions,
        stock_count=stock_count,
        low_stock_threshold=low_stock_threshold,
        clinic_cost=clinic_cost,
        active=active,
        strength=strength,
        form=form,
        best_use_within=best_use_within,
        dea_schedule=dea_schedule,
    )
    return await admin_inventory.update_inventory(product_id, body, image=image)


@router.patch("/products/{product_id}/stock")
def update_stock(
    product_id: str,
    body: UpdateStockRequest,
    _: dict = Depends(admin_user),
) -> dict:
    return admin_inventory.update_stock(product_id, body)


@router.post("/products/{product_id}/images")
async def upload_images(
    product_id: str,
    images: list[UploadFile] = File(...),
    _: dict = Depends(admin_user),
) -> dict:
    return await admin_inventory.upload_product_images(product_id, images)


@router.delete("/products/{product_id}")
def delete_product(product_id: str, _: dict = Depends(admin_user)) -> dict:
    return admin_inventory.deactivate_product(product_id)


@router.get("/categories")
def categories(
    product_type: str | None = Query(None, pattern="^(peptides|pharmacy)$"),
    _: dict = Depends(admin_user),
) -> dict:
    """List categories scoped to peptides or pharmacy."""
    return admin_inventory.get_categories(product_type)


@router.post("/categories")
def create_category(
    body: CreateCategoryRequest,
    _: dict = Depends(admin_user),
) -> dict:
    """Create a category for peptides or pharmacy products."""
    return admin_inventory.create_category_entry(body)
