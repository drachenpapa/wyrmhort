from unittest.mock import MagicMock

from firebase.firestore import get_expenses, add_expense, update_expense, delete_expense


def test_get_expenses(mock_db, sample_expense_data):
    doc = mock_db.collection().where().stream.return_value = [MagicMock()]
    doc[0].to_dict.return_value = sample_expense_data

    expenses = get_expenses(mock_db, category="Pokémon TCG")
    assert len(expenses) == 1
    assert expenses[0].product == "Pokémon TCG"


def test_add_expense(mock_db, expense_factory):
    add_expense(mock_db, expense_factory())
    mock_db.collection().document().set.assert_called_once()


def test_update_expense(mock_db, expense_factory):
    update_expense(mock_db, "some-id", expense_factory())
    mock_db.collection().document().update.assert_called_once()


def test_delete_expense(mock_db):
    delete_expense(mock_db, "some-id")
    mock_db.collection().document().delete.assert_called_once()
