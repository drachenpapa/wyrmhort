from datetime import datetime
from unittest.mock import MagicMock

import pytest

from expenses.models import Expense


@pytest.fixture
def sample_expense_data():
    return {
        "date": "2025-04-15T10:00:00",
        "amount": 4.99,
        "quantity": 1,
        "marketplace": "Cardmarket",
        "seller": "Louis",
        "product": "Pokémon TCG",
        "item_type": "Booster",
        "series": "Scarlet & Violet"
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
            quantity=data["quantity"],
            marketplace=data["marketplace"],
            seller=data["seller"],
            product=data["product"],
            item_type=data["item_type"],
            series=data["series"],
        )

    return _factory


@pytest.fixture
def mock_db():
    db = MagicMock()
    collection = db.collection.return_value
    collection.document.return_value = MagicMock()
    collection.where.return_value = MagicMock()
    return db
