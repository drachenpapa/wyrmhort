from fastapi.testclient import TestClient

from api.routes import app

client = TestClient(app)


def test_create_expense_success(valid_expense_payload):
    response = client.post("/api/expenses/", json=valid_expense_payload)
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["message"] == "Expense added successfully"


def test_create_expense_invalid_amount(valid_expense_payload):
    payload = valid_expense_payload.copy()
    payload["amount"] = -5
    response = client.post("/api/expenses/", json=payload)
    assert response.status_code == 422


def test_read_expenses(sample_expense_data):
    client.post("/api/expenses/", json=sample_expense_data)
    response = client.get("/api/expenses/")
    assert response.status_code == 200
    data = response.json()
    assert "expenses" in data
    assert isinstance(data["expenses"], list)


def test_update_expense(sample_expense_data):
    create_resp = client.post("/api/expenses/", json=sample_expense_data)
    expense_id = create_resp.json()["id"]
    update_payload = sample_expense_data.copy()
    update_payload["amount"] = 19.99
    response = client.put(f"/api/expenses/{expense_id}", json=update_payload)
    assert response.status_code == 200
    assert "updated" in response.json()["message"]


def test_delete_expense(sample_expense_data):
    create_resp = client.post("/api/expenses/", json=sample_expense_data)
    expense_id = create_resp.json()["id"]
    response = client.delete(f"/api/expenses/{expense_id}")
    assert response.status_code == 200
    assert "deleted" in response.json()["message"]
