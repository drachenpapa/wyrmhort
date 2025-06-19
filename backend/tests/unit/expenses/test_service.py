import pytest

from expenses.service import (
    create_expense_service,
    read_expenses_service,
    update_expense_service,
    delete_expense_service
)


@pytest.fixture
def mock_add_expense(mocker):
    return mocker.patch("expenses.service.add_expense", return_value="mock-id")


@pytest.fixture
def mock_get_expenses(mocker, sample_expense_data):
    return mocker.patch("expenses.service.get_expenses", return_value=[sample_expense_data])


@pytest.fixture
def mock_update_expense(mocker):
    return mocker.patch("expenses.service.update_expense")


@pytest.fixture
def mock_delete_expense(mocker):
    return mocker.patch("expenses.service.delete_expense")


def test_create_expense_service(mock_db, expense_factory, mock_add_expense):
    expense = expense_factory()
    result = create_expense_service(mock_db, "mock-uid", expense)
    assert result == "mock-id"
    mock_add_expense.assert_called_once()


def test_read_expenses_service(mock_db, mock_get_expenses, sample_expense_data):
    result = read_expenses_service(mock_db, "mock-uid", product="Pokémon")
    assert isinstance(result, list)
    assert result[0].id == sample_expense_data["id"]
    mock_get_expenses.assert_called_once()


def test_update_expense_service(mock_db, expense_factory, mock_update_expense):
    expense = expense_factory()
    update_expense_service(mock_db, "mock-uid", "some-id", expense)
    mock_update_expense.assert_called_once()


def test_delete_expense_service(mock_db, mock_delete_expense):
    delete_expense_service(mock_db, "mock-uid", "some-id")
    mock_delete_expense.assert_called_once()
