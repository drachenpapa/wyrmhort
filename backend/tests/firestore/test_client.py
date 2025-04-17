from datetime import datetime
from unittest.mock import MagicMock

import pytest

from expenses.models import Expense
from firestore.client import get_expenses, add_expense, update_expense, delete_expense


@pytest.fixture
def mock_firestore_client():
    return MagicMock()


def test_get_expenses(mock_firestore_client):
    mock_expense_data = {
        "amount": 10.0,
        "quantity": 2,
        "marketplace": "Cardmarket",
        "seller": "Louis",
        "product": "Pokémon",
        "item_type": "Booster",
        "series": "Scarlet & Violet",
        "date": "2025-04-15T10:00:00"
    }

    mock_doc = MagicMock()
    mock_doc.to_dict.return_value = mock_expense_data

    mock_query = MagicMock()
    mock_query.where.return_value = mock_query
    mock_query.stream.return_value = [mock_doc]

    mock_firestore_client.collection.return_value = mock_query

    expenses = get_expenses(mock_firestore_client, category="Pokémon")

    assert len(expenses) == 1
    assert expenses[0].product == "Pokémon"


def test_add_expense(mock_firestore_client):
    expense = Expense(
        date=datetime.now(),
        amount=4.99,
        quantity=1,
        marketplace="Cardmarket",
        seller="Louis",
        product="Pokémon",
        item_type="Booster",
        series="Scarlet & Violet"
    )

    add_expense(mock_firestore_client, expense)
    mock_firestore_client.collection().document().set.assert_called_once()


def test_update_expense(mock_firestore_client):
    expense = Expense(
        date=datetime.now(),
        amount=4.99,
        quantity=1,
        marketplace="Cardmarket",
        seller="Louis",
        product="Pokémon",
        item_type="Booster",
        series="Scarlet & Violet"
    )

    update_expense(mock_firestore_client, "some-expense-id", expense)
    mock_firestore_client.collection().document().update.assert_called_once()


def test_delete_expense(mock_firestore_client):
    delete_expense(mock_firestore_client, "some-expense-id")
    mock_firestore_client.collection().document().delete.assert_called_once()
