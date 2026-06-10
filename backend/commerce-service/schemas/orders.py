from __future__ import annotations

from pydantic import BaseModel, Field, model_validator


class OrderItemInput(BaseModel):
    store_id: str
    qty: int = Field(..., ge=1, le=99)


class OrderAddressInput(BaseModel):
    line1: str = Field(..., min_length=1)
    line2: str | None = None
    city: str = Field(..., min_length=1)
    state: str = Field(..., min_length=2, max_length=2)
    zip: str = Field(..., min_length=5, max_length=10)
    country: str = "US"


class CreatePatientOrderRequest(BaseModel):
    items: list[OrderItemInput] = Field(..., min_length=1)
    shipping_address_id: str | None = None
    shipping_address: OrderAddressInput | None = None
    notes: str | None = Field(None, max_length=2000)

    @model_validator(mode="after")
    def require_address(self) -> CreatePatientOrderRequest:
        if not self.shipping_address_id and not self.shipping_address:
            raise ValueError("Provide shipping_address_id or shipping_address")
        return self


class RejectOrderRequest(BaseModel):
    reason: str = Field(..., min_length=3, max_length=2000)
