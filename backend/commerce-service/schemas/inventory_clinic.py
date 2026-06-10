from decimal import Decimal

from pydantic import BaseModel, Field


class SetRetailPriceRequest(BaseModel):
    retail_price: Decimal = Field(..., ge=0)


class AddToStoreRequest(BaseModel):
    product_id: str
    variant_id: str | None = None
    retail_price: Decimal = Field(..., ge=0)


class BatchAddToStoreRequest(BaseModel):
    items: list[AddToStoreRequest] = Field(..., min_length=1, max_length=50)


class UpdateStorePriceRequest(BaseModel):
    retail_price: Decimal = Field(..., ge=0)


class UpdateStoreVisibilityRequest(BaseModel):
    is_visible: bool


class PatchStorePriceRequest(BaseModel):
    retail_price: Decimal = Field(..., ge=0)


class PatchStoreVisibilityRequest(BaseModel):
    is_visible: bool
