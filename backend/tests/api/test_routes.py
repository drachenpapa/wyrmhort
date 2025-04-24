from fastapi.testclient import TestClient

from api.routes import app

client = TestClient(app)


def test_create_expense(sample_expense_data):
    response = client.post("/api/expenses/", json=sample_expense_data)
    assert response.status_code == 200


def test_create_expense_validation_error(sample_expense_data):
    invalid_data = sample_expense_data.copy()
    del invalid_data["amount"]
    response = client.post("/api/expenses/", json=invalid_data)
    assert response.status_code == 422


def test_read_expenses(monkeypatch):
    mock_expenses = [{"product": "Pokémon TCG"}]

    def mock_service(db, uid, *args, **kwargs):
        return mock_expenses

    monkeypatch.setattr("api.routes.read_expenses_service", mock_service)
    response = client.get("/api/expenses/")
    assert response.status_code == 200
    assert response.json() == {"expenses": mock_expenses}


def test_update_expense(sample_expense_data):
    expense_id = "test-id"
    response = client.put(f"/api/expenses/{expense_id}", json=sample_expense_data)
    assert response.status_code == 200


def test_delete_expense():
    expense_id = "test-id"
    response = client.delete(f"/api/expenses/{expense_id}")
    assert response.status_code == 200


def test_read_expenses_with_filters(monkeypatch):
    mock_expenses = [{"product": "Pokémon TCG"}]

    def mock_service(db, uid, **kwargs):
        assert kwargs["product"] == "Pokémon TCG"
        assert kwargs["item_type"] == "Booster"
        return mock_expenses

    monkeypatch.setattr("api.routes.read_expenses_service", mock_service)
    response = client.get("/api/expenses/?product=Pokémon TCG&item_type=Booster")
    assert response.status_code == 200
    assert response.json() == {"expenses": mock_expenses}
