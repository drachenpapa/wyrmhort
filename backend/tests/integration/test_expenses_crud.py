import pytest
from fastapi.testclient import TestClient

from api.routes import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_create_expense_returns_201(valid_expense_payload):
    response = client.post("/api/expenses/", json=valid_expense_payload)
    assert response.status_code == 201
    data = response.json()
    assert "id" in data
    assert data["message"] == "Expense added successfully"


def test_create_expense_invalid_amount_returns_422(valid_expense_payload):
    valid_expense_payload["amount"] = -5
    response = client.post("/api/expenses/", json=valid_expense_payload)
    assert response.status_code == 422


def test_create_expense_missing_required_field_returns_422(valid_expense_payload):
    del valid_expense_payload["seller"]
    response = client.post("/api/expenses/", json=valid_expense_payload)
    assert response.status_code == 422


def test_read_expenses_returns_list(valid_expense_payload):
    client.post("/api/expenses/", json=valid_expense_payload)
    response = client.get("/api/expenses/")
    assert response.status_code == 200
    data = response.json()
    assert "expenses" in data
    assert isinstance(data["expenses"], list)


def test_update_expense_returns_200(valid_expense_payload):
    create_resp = client.post("/api/expenses/", json=valid_expense_payload)
    expense_id = create_resp.json()["id"]
    valid_expense_payload["amount"] = 19.99
    response = client.put(f"/api/expenses/{expense_id}", json=valid_expense_payload)
    assert response.status_code == 200
    assert "updated" in response.json()["message"]


def test_delete_expense_returns_200(valid_expense_payload):
    create_resp = client.post("/api/expenses/", json=valid_expense_payload)
    expense_id = create_resp.json()["id"]
    response = client.delete(f"/api/expenses/{expense_id}")
    assert response.status_code == 200
    assert "deleted" in response.json()["message"]
