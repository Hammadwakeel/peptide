from decimal import Decimal

from pydantic import BaseModel, Field


class CreateProductRequest(BaseModel):
    sku: str = Field(..., min_length=2, max_length=100)
    product_name: str = Field(..., min_length=2)
    category_id: str | None = None
    product_type: str = Field("ruo", pattern="^(ruo|pharmacy)$")
    description: str | None = None
    directions: str | None = None
    stock_count: int = Field(0, ge=0)
    stock_status: str = Field("in_stock", pattern="^(in_stock|low|out_of_stock|discontinued)$")
    clinic_cost: Decimal = Field(..., ge=0)
    strength: str | None = None
    form: str | None = None
    best_use_within: str | None = None
    dea_schedule: str | None = None
    image_url: str | None = None


class UpdateProductRequest(BaseModel):
    product_name: str | None = None
    category_id: str | None = None
    description: str | None = None
    directions: str | None = None
    stock_count: int | None = Field(None, ge=0)
    stock_status: str | None = Field(None, pattern="^(in_stock|low|out_of_stock|discontinued)$")
    clinic_cost: Decimal | None = Field(None, ge=0)
    active: bool | None = None
    strength: str | None = None
    form: str | None = None


class AddToStoreRequest(BaseModel):
    product_id: str
    variant_id: str | None = None
    retail_price: Decimal = Field(..., ge=0)


class UpdateStorePriceRequest(BaseModel):
    retail_price: Decimal = Field(..., ge=0)
    active: bool | None = None
