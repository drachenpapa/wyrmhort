from datetime import datetime
from unittest.mock import MagicMock

import pytest

from api.routes import get_db, app
from expenses.models import Expense
from firebase.auth import get_current_user_uid


@pytest.fixture
def sample_expense_data():
    return {
        "date": "2025-04-15T10:00:00",
        "amount": 4.99,
        "product": "Pokémon TCG",
        "item_type": "Booster",
        "series": "Scarlet & Violet",
        "quantity": 1,
        "seller": "Louis",
        "marketplace": "Cardmarket"
    }


@pytest.fixture
def expense_factory(sample_expense_data):
    def _factory(overrides=None):
        if overrides is None:
            overrides = {}
        data = {**sample_expense_data, **overrides}
        return Expense(
            date=datetime.fromisoformat(data["date"]),
            amount=data["amount"],
            product=data["product"],
            item_type=data["item_type"],
            series=data["series"],
            quantity=data["quantity"],
            seller=data["seller"],
            marketplace=data["marketplace"]
        )

    return _factory


@pytest.fixture
def mock_db():
    db = MagicMock()
    collection = db.collection.return_value
    collection.document.return_value = MagicMock()
    collection.where.return_value = MagicMock()
    return db


@pytest.fixture(autouse=True)
def override_dependencies(mock_db):
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_current_user_uid] = lambda: "mock-user-123"
    yield
    app.dependency_overrides.clear()
