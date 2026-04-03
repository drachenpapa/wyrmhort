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

    model_config = ConfigDict(str_strip_whitespace=True)

    date: Annotated[datetime, Field(description="Purchase date (ISO 8601 format)")]
    amount: Annotated[Decimal, Field(gt=0, description="Total amount paid (must be positive)")]
    product: Annotated[str, Field(min_length=1, description="Product name")]
    item_type: Annotated[str, Field(min_length=1, description="Type of item, e.g. Booster, Display")]
    series: Annotated[str, Field(min_length=1, description="Product series or edition")]
    quantity: Annotated[int, Field(ge=1, description="Number of items purchased (must be >= 1)")]
    seller: Annotated[str, Field(min_length=1, description="Name of the seller or store")]
    marketplace: Annotated[str | None, Field(None, description="Platform or marketplace, if any")]

    @field_validator("product", "item_type", "series", "seller", mode="after")
    @classmethod
    def autocorrect_strings(cls, value: str) -> str:
        return apply_autocorrections(value)

    @field_validator("marketplace", mode="after")
    @classmethod
    def autocorrect_marketplace(cls, value: str | None) -> str | None:
        if not value:
            return None
        return apply_autocorrections(value)


class ExpenseResponse(BaseModel):
    """Response model for a single expense."""

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


class ExpensesListResponse(BaseModel):
    """Response wrapping a paginated list of expenses."""

    expenses: list[ExpenseResponse]


class MessageResponse(BaseModel):
    """Generic operation-success response."""

    message: str


class CreateExpenseResponse(MessageResponse):
    """Response returned after a successful expense creation."""

    id: str
