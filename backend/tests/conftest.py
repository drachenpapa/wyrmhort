from datetime import datetime
from decimal import Decimal
from typing import Any
from unittest.mock import MagicMock

import pytest

from api.routes import app
from expenses.models import Expense
from firebase.auth import get_current_user_uid
from firebase.firestore import init_firestore


@pytest.fixture
def sample_expense_data() -> dict[str, Any]:
    """Raw dict matching the JSON shape of an expense - used as API payload and fixture base."""
    return {
        "id": "test-id",
        "date": "2025-04-15T10:00:00",
        "amount": 4.99,
        "product": "Pokémon TCG",
        "item_type": "Booster",
        "series": "Scarlet & Violet",
        "quantity": 1,
        "seller": "Louis",
        "marketplace": "Cardmarket",
    }


@pytest.fixture
def valid_expense_payload(sample_expense_data: dict[str, Any]) -> dict[str, Any]:
    """A valid API request payload (no 'id' field)."""
    payload = {**sample_expense_data}
    payload.pop("id", None)
    payload.update(
        date="2025-04-15T10:00:00",
        amount=9.99,
        quantity=2,
        product="Test Product",
        series="Test Series",
        seller="Test Seller",
        marketplace="Test Market",
    )
    return payload


@pytest.fixture
def expense_factory(sample_expense_data: dict[str, Any]):
    """Factory that builds typed Expense domain objects."""

    def _factory(overrides: dict[str, Any] | None = None) -> Expense:
        data = {**sample_expense_data, **(overrides or {})}
        return Expense(
            id=data["id"],
            date=datetime.fromisoformat(data["date"]),
            amount=Decimal(str(data["amount"])),
            product=data["product"],
            item_type=data["item_type"],
            series=data["series"],
            quantity=data["quantity"],
            seller=data["seller"],
            marketplace=data.get("marketplace"),
        )

    return _factory


@pytest.fixture
def mock_db() -> MagicMock:
    db = MagicMock()
    doc_ref = MagicMock()
    doc_ref.id = "mock-doc-id"
    db.collection.return_value.document.return_value.collection.return_value.document.return_value = doc_ref
    return db


@pytest.fixture(autouse=True)
def override_dependencies(mock_db: MagicMock):
    """Override FastAPI dependencies for every test that touches the app."""
    app.dependency_overrides[init_firestore] = lambda: mock_db
    app.dependency_overrides[get_current_user_uid] = lambda: "mock-user-123"
    yield
    app.dependency_overrides.clear()
