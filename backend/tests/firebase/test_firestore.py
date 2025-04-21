from unittest.mock import MagicMock

from firebase.firestore import get_expenses, add_expense, update_expense, delete_expense


def test_get_expenses(mock_db, sample_expense_data):
    mock_expenses_ref = MagicMock()
    mock_doc = MagicMock()
    mock_doc.to_dict.return_value = sample_expense_data

    mock_expenses_ref.where.return_value = mock_expenses_ref
    mock_expenses_ref.stream.return_value = [mock_doc]

    mock_db.collection.return_value.document.return_value.collection.return_value = mock_expenses_ref

    expenses = get_expenses(mock_db, "mock-uid", category="Pokémon TCG")
    assert isinstance(expenses, list)
    assert len(expenses) > 0
    assert expenses[0].product == "Pokémon TCG"


def test_add_expense(mock_db, expense_factory):
    add_expense(mock_db, "mock-uid", expense_factory())


def test_update_expense(mock_db, expense_factory):
    update_expense(mock_db, "mock-uid", "some-id", expense_factory())


def test_delete_expense(mock_db):
    delete_expense(mock_db, "mock-uid", "some-id")
