from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from api.routes import app, get_db

client = TestClient(app)

@pytest.fixture(autouse=True)
def override_db():
    mock = Mock()
    app.dependency_overrides[get_db] = lambda: mock
    yield
    app.dependency_overrides.clear()

def test_create_expense(sample_expense_data):
    response = client.post("/expenses/", json=sample_expense_data)
    assert response.status_code == 200
    assert response.json() == {"message": "Expense added successfully"}

def test_create_expense_validation_error(sample_expense_data):
    invalid_data = sample_expense_data.copy()
    del invalid_data["amount"]
    response = client.post("/expenses/", json=invalid_data)
    assert response.status_code == 422

def test_read_expenses(monkeypatch):
    mock_expenses = [{"product": "Pokémon TCG"}]

    def mock_service(db, *args, **kwargs):
        return mock_expenses

    monkeypatch.setattr("api.routes.read_expenses_service", mock_service)
    response = client.get("/expenses/")
    assert response.status_code == 200
    assert response.json() == {"expenses": mock_expenses}

def test_update_expense(sample_expense_data):
    expense_id = "test-id"
    response = client.put(f"/expenses/{expense_id}", json=sample_expense_data)
    assert response.status_code == 200
    assert response.json() == {"message": f"Expense with ID {expense_id} updated."}

def test_delete_expense():
    expense_id = "test-id"
    response = client.delete(f"/expenses/{expense_id}")
    assert response.status_code == 200
    assert response.json() == {"message": f"Expense with ID {expense_id} deleted."}
