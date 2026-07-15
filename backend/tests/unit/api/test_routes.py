from datetime import datetime
from decimal import Decimal

import pytest
from fastapi.responses import JSONResponse

from api.routes import create_expense, delete_expense, health_check, read_expenses, update_expense
from expenses.schemas import (
    ExpenseRequest,
    ExpenseResponse,
    ExpensesListResponse,
    MessageResponse,
)


@pytest.fixture
def mock_services(mocker, expense_factory):
    created = ExpenseResponse(
        id="new-id",
        date=datetime(2025, 4, 15, 10, 0, 0),
        amount=Decimal("9.99"),
        product="Test Product",
        item_type="Booster",
        series="Test Series",
        quantity=2,
        seller="Test Seller",
        marketplace="Test Market",
    )
    return {
        "create": mocker.patch("api.routes.create_expense_service", return_value=created),
        "read": mocker.patch("api.routes.read_expenses_service", return_value=[]),
        "update": mocker.patch("api.routes.update_expense_service"),
        "delete": mocker.patch("api.routes.delete_expense_service"),
    }


@pytest.fixture
def expense_request(sample_expense_data) -> ExpenseRequest:
    return ExpenseRequest(**sample_expense_data)


async def test_health_check():
    response = await health_check()
    assert isinstance(response, JSONResponse)
    assert response.status_code == 200
    assert response.body == b'{"status":"healthy"}'



async def test_create_expense_returns_response(mock_db, expense_request, mock_services):
    result = await create_expense(expense=expense_request, db=mock_db, uid="user-123")
    assert isinstance(result, ExpenseResponse)
    assert result.id == "new-id"


async def test_create_expense_calls_service(mock_db, expense_request, mock_services):
    await create_expense(expense=expense_request, db=mock_db, uid="user-123")
    mock_services["create"].assert_called_once_with(mock_db, "user-123", expense_request)


async def test_read_expenses_returns_response(mock_db, mock_services):
    result = await read_expenses(db=mock_db, uid="user-123")
    assert isinstance(result, ExpensesListResponse)
    assert result.expenses == []


async def test_read_expenses_passes_filters_to_service(mock_db, mock_services):
    await read_expenses(db=mock_db, uid="user-123", product="Pokémon TCG", item_type="Booster")
    _, kwargs = mock_services["read"].call_args
    assert kwargs["product"] == "Pokémon TCG"
    assert kwargs["item_type"] == "Booster"


async def test_update_expense_returns_response(mock_db, expense_request, mock_services):
    result = await update_expense(expense_id="test-id", expense=expense_request, db=mock_db, uid="user-123")
    assert isinstance(result, MessageResponse)
    assert "test-id" in result.message


async def test_update_expense_calls_service(mock_db, expense_request, mock_services):
    await update_expense(expense_id="test-id", expense=expense_request, db=mock_db, uid="user-123")
    mock_services["update"].assert_called_once_with(mock_db, "user-123", "test-id", expense_request)


async def test_delete_expense_returns_response(mock_db, mock_services):
    result = await delete_expense(expense_id="test-id", db=mock_db, uid="user-123")
    assert isinstance(result, MessageResponse)
    assert "test-id" in result.message


async def test_delete_expense_calls_service(mock_db, mock_services):
    await delete_expense(expense_id="test-id", db=mock_db, uid="user-123")
    mock_services["delete"].assert_called_once_with(mock_db, "user-123", "test-id")
