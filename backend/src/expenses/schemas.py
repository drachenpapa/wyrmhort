from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ExpenseRequest(BaseModel):
    date: datetime = Field(..., description="Purchase date (ISO 8601)")
    amount: Decimal = Field(..., gt=0, description="Total amount paid")
    product: str = Field(..., description="Product name")
    item_type: str = Field(..., description="Type of item, e.g. Booster, Display")
    series: Optional[str] = Field(None, description="Product series or edition")
    quantity: int = Field(..., ge=1, description="Number of items purchased")
    seller: str = Field(..., description="Name of the seller or store")
    marketplace: Optional[str] = Field(None, description="Platform or marketplace, if any")

    @field_validator("seller", "product", "item_type", mode="before")
    def validate_non_empty_strings(v, info):
        if not isinstance(v, str) or not v.strip():
            raise ValueError(f"{info.field_name} must be a non-empty string")
        return v

    @field_validator("series", "marketplace", mode="before")
    def validate_optional_strings(v, info):
        if v is not None and (not isinstance(v, str) or not v.strip()):
            raise ValueError(f"{info.field_name} must be a non-empty string if provided")
        return v
