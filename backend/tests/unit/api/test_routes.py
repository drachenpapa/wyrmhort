import pytest

from api.routes import HealthResponse, create_expense, delete_expense, health_check, read_expenses, update_expense
from expenses.schemas import (
    CreateExpenseResponse,
    ExpenseRequest,
    ExpensesListResponse,
    MessageResponse,
)


@pytest.fixture
def mock_services(mocker, expense_factory):
    return {
        "create": mocker.patch("api.routes.create_expense_service", return_value="new-id"),
        "read": mocker.patch("api.routes.read_expenses_service", return_value=[]),
        "update": mocker.patch("api.routes.update_expense_service"),
        "delete": mocker.patch("api.routes.delete_expense_service"),
    }


@pytest.fixture
def expense_request(sample_expense_data) -> ExpenseRequest:
    return ExpenseRequest(**sample_expense_data)


def test_health_check():
    response = health_check()
    assert isinstance(response, HealthResponse)
    assert response.status == "healthy"



def test_create_expense_returns_response(mock_db, expense_request, mock_services):
    result = create_expense(expense=expense_request, db=mock_db, uid="user-123")
    assert isinstance(result, CreateExpenseResponse)
    assert result.message == "Expense added successfully"
    assert result.id == "new-id"


def test_create_expense_calls_service(mock_db, expense_request, mock_services):
    create_expense(expense=expense_request, db=mock_db, uid="user-123")
    mock_services["create"].assert_called_once_with(mock_db, "user-123", expense_request)


def test_read_expenses_returns_response(mock_db, mock_services):
    result = read_expenses(db=mock_db, uid="user-123")
    assert isinstance(result, ExpensesListResponse)
    assert result.expenses == []


def test_read_expenses_passes_filters_to_service(mock_db, mock_services):
    read_expenses(db=mock_db, uid="user-123", product="Pokémon TCG", item_type="Booster")
    _, kwargs = mock_services["read"].call_args
    assert kwargs["product"] == "Pokémon TCG"
    assert kwargs["item_type"] == "Booster"


def test_update_expense_returns_response(mock_db, expense_request, mock_services):
    result = update_expense(expense_id="test-id", expense=expense_request, db=mock_db, uid="user-123")
    assert isinstance(result, MessageResponse)
    assert "test-id" in result.message


def test_update_expense_calls_service(mock_db, expense_request, mock_services):
    update_expense(expense_id="test-id", expense=expense_request, db=mock_db, uid="user-123")
    mock_services["update"].assert_called_once_with(mock_db, "user-123", "test-id", expense_request)


def test_delete_expense_returns_response(mock_db, mock_services):
    result = delete_expense(expense_id="test-id", db=mock_db, uid="user-123")
    assert isinstance(result, MessageResponse)
    assert "test-id" in result.message


def test_delete_expense_calls_service(mock_db, mock_services):
    delete_expense(expense_id="test-id", db=mock_db, uid="user-123")
    mock_services["delete"].assert_called_once_with(mock_db, "user-123", "test-id")
