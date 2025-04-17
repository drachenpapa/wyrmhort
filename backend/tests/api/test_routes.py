import pytest
from fastapi.testclient import TestClient

from api.routes import app


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
