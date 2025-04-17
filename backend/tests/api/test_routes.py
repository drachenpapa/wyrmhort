from unittest.mock import patch, MagicMock
from fastapi.testclient import TestClient
from api.main import app

client = TestClient(app)

mock_expense = {
    "id": "test-id",
    "date": "2025-04-15T10:00:00",
    "amount": 4.99,
    "quantity": 1,
    "marketplace": "Cardmarket",
    "seller": "Louis",
    "product": "Pokémon TCG",
    "item_type": "Booster",
    "series": "Scarlet & Violet",
}

@patch("api.routes.get_db", return_value=MagicMock())
@patch("api.routes.create_expense_service")
def test_create_expense(mock_create_service, mock_get_db):
    mock_create_service.return_value = mock_expense
    response = client.post("/expenses/", json=mock_expense)
    assert response.status_code == 201
    assert response.json() == mock_expense


@patch("api.routes.get_db", return_value=MagicMock())
@patch("api.routes.read_expense_service")
def test_read_expense(mock_read_service, mock_get_db):
    mock_read_service.return_value = mock_expense
    response = client.get("/expenses/test-id")
    assert response.status_code == 200
    assert response.json() == mock_expense


@patch("api.routes.get_db", return_value=MagicMock())
@patch("api.routes.update_expense_service")
def test_update_expense(mock_update_service, mock_get_db):
    updated_expense = {**mock_expense, "amount": 9.99}
    mock_update_service.return_value = updated_expense
    response = client.put("/expenses/test-id", json=updated_expense)
    assert response.status_code == 200
    assert response.json() == updated_expense


@patch("api.routes.get_db", return_value=MagicMock())
@patch("api.routes.delete_expense_service")
def test_delete_expense(mock_delete_service, mock_get_db):
    mock_delete_service.return_value = {"message": "Expense deleted"}
    response = client.delete("/expenses/test-id")
    assert response.status_code == 200
    assert response.json() == {"message": "Expense deleted"}
