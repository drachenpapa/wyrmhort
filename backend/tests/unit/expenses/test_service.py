import pytest

from expenses.schemas import ExpenseRequest, ExpenseResponse
from expenses.service import (
    create_expense_service,
    delete_expense_service,
    read_expenses_service,
    update_expense_service,
)


@pytest.fixture
def expense_request(sample_expense_data) -> ExpenseRequest:
    return ExpenseRequest(**sample_expense_data)


@pytest.fixture
def mock_add(mocker):
    return mocker.patch("expenses.service.add_expense", return_value="mock-id")


@pytest.fixture
def mock_get(mocker, expense_factory):
    return mocker.patch("expenses.service.get_expenses", return_value=[expense_factory()])


@pytest.fixture
def mock_update(mocker):
    return mocker.patch("expenses.service.update_expense")


@pytest.fixture
def mock_delete(mocker):
    return mocker.patch("expenses.service.delete_expense")


def test_create_returns_expense_id(mock_db, expense_request, mock_add):
    result = create_expense_service(mock_db, "uid-1", expense_request)
    assert result == "mock-id"
    mock_add.assert_called_once()


def test_read_returns_response_list(mock_db, mock_get, sample_expense_data):
    result = read_expenses_service(mock_db, "uid-1")
    assert isinstance(result, list)
    assert all(isinstance(r, ExpenseResponse) for r in result)
    assert result[0].id == sample_expense_data["id"]


def test_read_passes_filters_to_firestore(mock_db, mock_get):
    read_expenses_service(mock_db, "uid-1", product="Pokémon TCG", seller="Louis")
    _, kwargs = mock_get.call_args
    assert kwargs["product"] == "Pokémon TCG"
    assert kwargs["seller"] == "Louis"


def test_read_ascending_sort(mock_db, mock_get):
    read_expenses_service(mock_db, "uid-1", sort="date")
    _, kwargs = mock_get.call_args
    assert kwargs["order_by"] == "date"
    assert kwargs["ascending"] is True


def test_read_invalid_sort_field_defaults_to_date(mock_db, mock_get):
    read_expenses_service(mock_db, "uid-1", sort="invalid_field")
    _, kwargs = mock_get.call_args
    assert kwargs["order_by"] == "date"
    assert kwargs["ascending"] is False



def test_update_calls_firestore(mock_db, expense_request, mock_update):
    update_expense_service(mock_db, "uid-1", "expense-id", expense_request)
    mock_update.assert_called_once()


# ── delete ────────────────────────────────────────────────────────────────────

def test_delete_calls_firestore(mock_db, mock_delete):
    delete_expense_service(mock_db, "uid-1", "expense-id")
    mock_delete.assert_called_once_with(mock_db, "uid-1", "expense-id")
