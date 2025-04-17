import pytest
from unittest.mock import Mock
from fastapi.testclient import TestClient

from api.routes import app, get_db


@pytest.fixture(autouse=True)
def override_firestore_dependency():
    mock_db = Mock()
    app.dependency_overrides[get_db] = lambda: mock_db
    yield
    app.dependency_overrides.clear()


@pytest.fixture
def client():
    return TestClient(app)


def test_create_expense(client):
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


def test_read_expenses(client):
    response = client.get("/expenses/")
    assert response.status_code == 200
    assert "expenses" in response.json()


def test_update_expense(client):
    expense_id = "mocked_id"
    updated_data = {
        "date": "2025-04-16T15:30:00",
        "amount": 9.99,
        "quantity": 2,
        "marketplace": "eBay",
        "seller": "Anna",
        "product": "Yu-Gi-Oh!",
        "item_type": "Display",
        "series": "Pharaoh's Legacy"
    }

    response = client.put(f"/expenses/{expense_id}", json=updated_data)
    assert response.status_code == 200
    assert response.json() == {"message": f"Expense with ID {expense_id} updated."}


def test_delete_expense(client):
    expense_id = "mocked_id"

    response = client.delete(f"/expenses/{expense_id}")
    assert response.status_code == 200
    assert response.json() == {"message": f"Expense with ID {expense_id} deleted."}
