import re
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, field_validator

AUTOCORRECTIONS = {
    r"pokemon": "Pokémon",
}


def apply_autocorrections(text: str) -> str:
    """Apply all defined autocorrections to the text (case-insensitive)."""
    result = text
    for pattern, replacement in AUTOCORRECTIONS.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    return result


class ExpenseRequest(BaseModel):
    date: datetime = Field(..., description="Purchase date (ISO 8601)")
    amount: Decimal = Field(..., gt=0, description="Total amount paid")
    product: str = Field(..., description="Product name")
    item_type: str = Field(..., description="Type of item, e.g. Booster, Display")
    series: str = Field(..., description="Product series or edition")
    quantity: int = Field(..., ge=1, description="Number of items purchased")
    seller: str = Field(..., description="Name of the seller or store")
    marketplace: str | None = Field(None, description="Platform or marketplace, if any")

    @field_validator("product", "item_type", "series", "seller", mode="before")
    def validate_non_empty_strings(self, info):
        if not isinstance(self, str) or not self.strip():
            raise ValueError(f"{info.field_name} must be a non-empty string")
        return apply_autocorrections(self)

    @field_validator("marketplace", mode="before")
    def validate_optional_strings(self, info):
        if self is not None and (not isinstance(self, str) or not self.strip()):
            raise ValueError(f"{info.field_name} must be a non-empty string if provided")
        if self is not None:
            return apply_autocorrections(self)
        return self


class ExpenseResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    date: datetime
    amount: Decimal
    product: str
    item_type: str
    series: str
    quantity: int
    seller: str
    marketplace: str | None
