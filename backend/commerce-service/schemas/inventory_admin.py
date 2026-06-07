from decimal import Decimal

from pydantic import BaseModel, Field


class CreateProductRequest(BaseModel):
    sku: str = Field(..., min_length=2, max_length=100)
    product_name: str = Field(..., min_length=2)
    category_id: str | None = None
    product_type: str = Field("ruo", pattern="^(ruo|pharmacy)$")
    description: str | None = None
    short_description: str | None = None
    directions: str | None = None
    stock_count: int = Field(0, ge=0)
    low_stock_threshold: int = Field(10, ge=0)
    clinic_cost: Decimal = Field(..., ge=0)
    strength: str | None = None
    form: str | None = None
    best_use_within: str | None = None
    dea_schedule: str | None = None


class UpdateProductRequest(BaseModel):
    product_name: str | None = None
    category_id: str | None = None
    description: str | None = None
    short_description: str | None = None
    directions: str | None = None
    stock_count: int | None = Field(None, ge=0)
    low_stock_threshold: int | None = Field(None, ge=0)
    clinic_cost: Decimal | None = Field(None, ge=0)
    active: bool | None = None
    strength: str | None = None
    form: str | None = None
    best_use_within: str | None = None
    dea_schedule: str | None = None


class UpdateStockRequest(BaseModel):
    stock_count: int = Field(..., ge=0)
    low_stock_threshold: int | None = Field(None, ge=0)


class CreateCategoryRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    description: str | None = None
    sort_order: int = Field(0, ge=0)
