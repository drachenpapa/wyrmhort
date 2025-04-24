import pytest

from expenses.schemas import ExpenseRequest


def test_valid_expense_request(sample_expense_data):
    expense = ExpenseRequest(**sample_expense_data)
    assert expense.product == sample_expense_data["product"]


def test_invalid_date_format(sample_expense_data):
    sample_expense_data["date"] = "15-04-2025"
    with pytest.raises(ValueError):
        ExpenseRequest(**sample_expense_data)


def test_invalid_amount(sample_expense_data):
    sample_expense_data["amount"] = -10
    with pytest.raises(ValueError):
        ExpenseRequest(**sample_expense_data)


def test_empty_seller(sample_expense_data):
    sample_expense_data["seller"] = "   "
    with pytest.raises(ValueError):
        ExpenseRequest(**sample_expense_data)


def test_blank_marketplace(sample_expense_data):
    sample_expense_data["marketplace"] = "   "
    with pytest.raises(ValueError):
        ExpenseRequest(**sample_expense_data)
