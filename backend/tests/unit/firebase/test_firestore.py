from decimal import Decimal
from unittest.mock import MagicMock

from firebase.firestore import add_expense, delete_expense, get_expenses, update_expense


def _make_expenses_ref(mock_db: MagicMock, docs: list) -> MagicMock:
    """Wire up a mock Firestore collection chain that streams the given docs."""
    ref = MagicMock()
    ref.where.return_value = ref
    ref.order_by.return_value = ref
    ref.stream.return_value = docs
    mock_db.collection.return_value.document.return_value.collection.return_value = ref
    return ref


def _make_doc(data: dict) -> MagicMock:
    doc = MagicMock()
    doc.to_dict.return_value = data
    doc.id = data.get("id", "doc-id")
    return doc


def test_get_expenses_returns_expense_list(mock_db, sample_expense_data):
    doc = _make_doc(sample_expense_data)
    _make_expenses_ref(mock_db, [doc])

    results = get_expenses(mock_db, "uid-1")

    assert len(results) == 1
    assert results[0].product == sample_expense_data["product"]
    assert results[0].amount == Decimal(str(sample_expense_data["amount"]))


def test_get_expenses_empty_collection(mock_db):
    _make_expenses_ref(mock_db, [])
    assert get_expenses(mock_db, "uid-1") == []


def test_get_expenses_applies_filter(mock_db, sample_expense_data):
    ref = _make_expenses_ref(mock_db, [_make_doc(sample_expense_data)])
    get_expenses(mock_db, "uid-1", product="Pokémon TCG")
    ref.where.assert_called()


def test_add_expense_returns_doc_id(mock_db, expense_factory):
    mock_doc_ref = MagicMock()
    mock_doc_ref.id = "generated-id"
    mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value = mock_doc_ref

    result = add_expense(mock_db, "uid-1", expense_factory())

    assert result == "generated-id"
    mock_doc_ref.set.assert_called_once()


def test_add_expense_without_marketplace(mock_db, expense_factory):
    expense = expense_factory({"marketplace": None})
    add_expense(mock_db, "uid-1", expense)  # must not raise


def test_update_expense_calls_firestore_update(mock_db, expense_factory):
    mock_doc_ref = MagicMock()
    mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value = mock_doc_ref

    update_expense(mock_db, "uid-1", "expense-id", expense_factory())

    mock_doc_ref.update.assert_called_once()


def test_delete_expense_calls_firestore_delete(mock_db):
    mock_doc_ref = MagicMock()
    mock_db.collection.return_value.document.return_value.collection.return_value.document.return_value = mock_doc_ref

    delete_expense(mock_db, "uid-1", "expense-id")

    mock_doc_ref.delete.assert_called_once()
