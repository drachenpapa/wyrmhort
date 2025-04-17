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