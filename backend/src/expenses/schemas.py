from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ExpenseRequest(BaseModel):
    date: datetime
    amount: Decimal = Field(..., gt=0, description="Amount must be greater than 0")
    product: str
    item_type: str
    series: Optional[str] = None
    quantity: int = Field(..., ge=1, description="Quantity must be at least 1")
    seller: str
    marketplace: Optional[str] = None

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
