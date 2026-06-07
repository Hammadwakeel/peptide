from decimal import Decimal

from pydantic import BaseModel, Field


class SetRetailPriceRequest(BaseModel):
    retail_price: Decimal = Field(..., ge=0)


class AddToStoreRequest(BaseModel):
    product_id: str
    variant_id: str | None = None
    retail_price: Decimal = Field(..., ge=0)


class UpdateStorePriceRequest(BaseModel):
    retail_price: Decimal = Field(..., ge=0)
    active: bool | None = None
