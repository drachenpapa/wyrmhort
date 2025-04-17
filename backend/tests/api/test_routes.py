import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch, MagicMock
from datetime import datetime

from api.routes import app

@pytest.fixture
def client():
    return TestClient(app)

@patch("api.routes.create_expense_service")
def test_create_expense(mock_create_service, client):
    expense_data = {
        "date": "2025-04-15T10:00:00",
        "amount": 4.99,
        "quantity": 1,
        "marketplace": "Cardmarket",
        "seller": "Louis",
        "product": "Pokémon TCG",
        "item_type": "Booster",
        "series": "Scarlet & Violet"
    }

    response = client.post("/expenses/", json=expense_data)

    assert response.status_code == 200
    assert response.json() == {"message": "Expense added successfully"}
    assert mock_create_service.call_count == 1

    called_args, _ = mock_create_service.call_args
    expense_obj = called_args[1]
    assert expense_obj.amount == 4.99
    assert expense_obj.seller == "Louis"

@patch("api.routes.read_expenses_service")
def test_read_expenses(mock_read_service, client):
    mock_read_service.return_value = [{"amount": 10.0, "seller": "Alice"}]

    response = client.get("/expenses/")

    assert response.status_code == 200
    assert response.json() == {"expenses": [{"amount": 10.0, "seller": "Alice"}]}
    mock_read_service.assert_called_once()

@patch("api.routes.update_expense_service")
def test_update_expense(mock_update_service, client):
    expense_id = "abc123"
    updated_data = {
        "date": "2025-04-16T12:00:00",
        "amount": 7.50,
        "quantity": 2,
        "marketplace": "eBay",
        "seller": "Bob",
        "product": "Magic: The Gathering",
        "item_type": "Booster",
        "series": "Throne of Eldraine"
    }

    response = client.put(f"/expenses/{expense_id}", json=updated_data)

    assert response.status_code == 200
    assert response.json() == {"message": f"Expense with ID {expense_id} updated."}
    assert mock_update_service.call_count == 1

    called_args, _ = mock_update_service.call_args
    assert called_args[0] == expense_id
    updated_expense = called_args[1]
    assert updated_expense.product == "Magic: The Gathering"
    assert updated_expense.amount == 7.50

@patch("api.routes.delete_expense_service")
def test_delete_expense(mock_delete_service, client):
    expense_id = "xyz789"

    response = client.delete(f"/expenses/{expense_id}")

    assert response.status_code == 200
    assert response.json() == {"message": f"Expense with ID {expense_id} deleted."}
    mock_delete_service.assert_called_once_with(ANY, expense_id)

from unittest.mock import ANY