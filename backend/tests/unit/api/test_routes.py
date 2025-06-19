import pytest
import pytest_asyncio
from fastapi.responses import JSONResponse

from api.routes import health_check, create_expense, read_expenses, update_expense, delete_expense
from expenses.schemas import ExpenseResponse


@pytest_asyncio.fixture
def anyio_backend():
    return 'asyncio'


@pytest.fixture(autouse=True)
def mock_services(mocker, sample_expense_data):
    mocks = {'create': mocker.patch("api.routes.create_expense_service", return_value="1"),
             'read': mocker.patch("api.routes.read_expenses_service",
                                  return_value=[ExpenseResponse(**sample_expense_data)]),
             'update': mocker.patch("api.routes.update_expense_service", return_value={"message": "Expense updated"}),
             'delete': mocker.patch("api.routes.delete_expense_service", return_value={"message": "Expense deleted"})}
    return mocks


@pytest.mark.asyncio
async def test_health_check():
    response = await health_check()
    assert isinstance(response, JSONResponse)
    assert response.status_code == 200
    assert response.body == b'{"status":"healthy"}'


@pytest.mark.asyncio
async def test_create_expense(sample_expense_data, mock_services):
    result = await create_expense(expense=sample_expense_data)
    assert isinstance(result, dict)
    assert result["message"] == "Expense added successfully"
    assert result["id"] == "1"
    mock_services['create'].assert_called_once()


@pytest.mark.asyncio
async def test_create_expense_validation_error(sample_expense_data):
    invalid_data = sample_expense_data.copy()
    del invalid_data["amount"]
    result = await create_expense(expense=invalid_data)
    assert isinstance(result, dict)
    assert "message" in result


@pytest.mark.asyncio
async def test_read_expenses(expense_factory, sample_expense_data, mock_services):
    result = await read_expenses()
    assert isinstance(result, dict)
    assert result["expenses"][0]["id"] == sample_expense_data["id"]
    mock_services['read'].assert_called_once()


@pytest.mark.asyncio
async def test_read_expenses_with_filters(expense_factory, sample_expense_data, mock_services):
    result = await read_expenses(product="Pokémon TCG", item_type="Booster")
    assert isinstance(result, dict)
    assert result["expenses"][0]["id"] == sample_expense_data["id"]
    assert mock_services['read'].call_count == 1
    _, kwargs = mock_services['read'].call_args
    assert kwargs["product"] == "Pokémon TCG"
    assert kwargs["item_type"] == "Booster"


@pytest.mark.asyncio
async def test_update_expense(sample_expense_data, mock_services):
    expense_id = "test-id"
    result = await update_expense(expense_id=expense_id, expense=sample_expense_data)
    assert isinstance(result, dict)
    assert "updated" in result["message"]
    mock_services['update'].assert_called_once()


@pytest.mark.asyncio
async def test_delete_expense(mock_services):
    expense_id = "test-id"
    result = await delete_expense(expense_id=expense_id)
    assert isinstance(result, dict)
    assert "deleted" in result["message"]
    mock_services['delete'].assert_called_once()
