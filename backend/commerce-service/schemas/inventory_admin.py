from decimal import Decimal

from pydantic import BaseModel, Field, field_validator, model_validator


def _blank_to_none(value: str | None) -> str | None:
    if value is None:
        return None
    stripped = value.strip()
    return stripped or None


def _normalize_product_payload(data: dict) -> dict:
    optional = (
        "description", "directions", "strength", "form", "best_use_within", "dea_schedule",
        "product_name", "category_id",
    )
    for key in optional:
        if key in data and isinstance(data[key], str):
            data[key] = _blank_to_none(data[key])
    product_type = data.get("product_type", "peptides")
    if product_type == "peptides":
        data["dea_schedule"] = None
    else:
        for key in ("strength", "form", "best_use_within"):
            data[key] = None
    return data


class CreateProductRequest(BaseModel):
    sku: str = Field(..., min_length=2, max_length=100)
    product_name: str = Field(..., min_length=2)
    category_id: str | None = None
    product_type: str = Field("peptides", pattern="^(peptides|pharmacy)$")
    description: str | None = None
    directions: str | None = None
    stock_count: int = Field(0, ge=0)
    low_stock_threshold: int = Field(10, ge=0)
    clinic_cost: Decimal = Field(..., ge=0)
    strength: str | None = None
    form: str | None = None
    best_use_within: str | None = None
    dea_schedule: str | None = None

    @model_validator(mode="before")
    @classmethod
    def normalize_create_payload(cls, data: object) -> object:
        if isinstance(data, dict):
            return _normalize_product_payload(data)
        return data


class UpdateProductRequest(BaseModel):
    product_name: str | None = None
    category_id: str | None = None
    description: str | None = None
    directions: str | None = None
    stock_count: int | None = Field(None, ge=0)
    low_stock_threshold: int | None = Field(None, ge=0)
    clinic_cost: Decimal | None = Field(None, ge=0)
    active: bool | None = None
    strength: str | None = None
    form: str | None = None
    best_use_within: str | None = None
    dea_schedule: str | None = None

    @field_validator(
        "product_name", "category_id", "description", "directions",
        "strength", "form", "best_use_within", "dea_schedule",
        mode="before",
    )
    @classmethod
    def normalize_optional_strings(cls, value: str | None) -> str | None:
        if value is None or not isinstance(value, str):
            return value
        return _blank_to_none(value)


class UpdateStockRequest(BaseModel):
    stock_count: int = Field(..., ge=0)
    low_stock_threshold: int | None = Field(None, ge=0)


class CreateCategoryRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=255)
    product_type: str = Field(..., pattern="^(peptides|pharmacy)$")
    description: str | None = None
    sort_order: int = Field(0, ge=0)

    @field_validator("description", mode="before")
    @classmethod
    def normalize_description(cls, value: str | None) -> str | None:
        if value is None or not isinstance(value, str):
            return value
        return _blank_to_none(value)
