import re
from datetime import datetime
from decimal import Decimal
from typing import Annotated

from pydantic import BaseModel, ConfigDict, Field, field_validator

AUTOCORRECTIONS: dict[str, str] = {
    r"pokemon": "Pokémon",
}


def apply_autocorrections(text: str) -> str:
    """Apply all defined autocorrections to the text (case-insensitive)."""
    result = text
    for pattern, replacement in AUTOCORRECTIONS.items():
        result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
    return result


class ExpenseRequest(BaseModel):
    """Request model for creating or updating an expense."""

    date: Annotated[datetime, Field(description="Purchase date (ISO 8601 format)")]
    amount: Annotated[Decimal, Field(gt=0, description="Total amount paid (must be positive)")]
    product: Annotated[str, Field(min_length=1, description="Product name")]
    item_type: Annotated[str, Field(min_length=1, description="Type of item, e.g. Booster, Display")]
    series: Annotated[str, Field(min_length=1, description="Product series or edition")]
    quantity: Annotated[int, Field(ge=1, description="Number of items purchased (must be >= 1)")]
    seller: Annotated[str, Field(min_length=1, description="Name of the seller or store")]
    marketplace: Annotated[str | None, Field(None, description="Platform or marketplace, if any")]

    @field_validator("product", "item_type", "series", "seller", mode="before")
    @classmethod
    def validate_non_empty_strings(cls, value: str, info) -> str:
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"{info.field_name} must be a non-empty string")
        return apply_autocorrections(value)

    @field_validator("marketplace", mode="before")
    @classmethod
    def validate_optional_strings(cls, value: str | None, info) -> str | None:
        if value is not None and (not isinstance(value, str) or not value.strip()):
            raise ValueError(f"{info.field_name} must be a non-empty string if provided")
        if value is not None:
            return apply_autocorrections(value)
        return value


class ExpenseResponse(BaseModel):
    """Response model for expense data."""

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
