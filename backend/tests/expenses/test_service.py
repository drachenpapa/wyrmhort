from datetime import datetime
from unittest.mock import MagicMock

from expenses.models import Expense
from expenses.service import create_expense_service, read_expenses_service, update_expense_service, \
    delete_expense_service


def sample_expense():
    return Expense(
        date=datetime.now(),
        amount=4.99,
        quantity=1,
        marketplace="Cardmarket",
        seller="Louis",
        product="Pokémon TCG",
        item_type="Booster",
        series="Scarlet & Violet"
    )


def test_create_expense_service():
    mock_db = MagicMock()
    expense = sample_expense()
    create_expense_service(mock_db, expense)
    mock_db.collection().document().set.assert_called_once()


def test_read_expenses_service():
    mock_db = MagicMock()
    mock_collection = MagicMock()
    mock_where = MagicMock()
    mock_where.stream.return_value = []
    mock_collection.where.return_value = mock_where
    mock_db.collection.return_value = mock_collection
    read_expenses_service(mock_db, category="Pokémon")
    mock_where.stream.assert_called_once()


def test_update_expense_service():
    mock_db = MagicMock()
    expense = sample_expense()
    update_expense_service(mock_db, "some-expense-id", expense)
    mock_db.collection().document().update.assert_called_once()


def test_delete_expense_service():
    mock_db = MagicMock()
    delete_expense_service(mock_db, "some-expense-id")
    mock_db.collection().document().delete.assert_called_once()
