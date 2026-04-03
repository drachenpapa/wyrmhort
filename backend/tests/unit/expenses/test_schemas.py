import pytest
from pydantic import ValidationError

from expenses.schemas import ExpenseRequest


def test_valid_expense_accepted(sample_expense_data):
    expense = ExpenseRequest(**sample_expense_data)
    assert expense.product == sample_expense_data["product"]
    assert expense.marketplace == sample_expense_data["marketplace"]


def test_marketplace_none_accepted(sample_expense_data):
    sample_expense_data["marketplace"] = None
    expense = ExpenseRequest(**sample_expense_data)
    assert expense.marketplace is None


def test_marketplace_omitted_defaults_to_none(sample_expense_data):
    sample_expense_data.pop("marketplace")
    expense = ExpenseRequest(**sample_expense_data)
    assert expense.marketplace is None


def test_pokemon_name_autocorrected(sample_expense_data):
    sample_expense_data["product"] = "pokemon tcg"
    expense = ExpenseRequest(**sample_expense_data)
    assert "Pokémon" in expense.product


def test_whitespace_stripped_from_string_fields(sample_expense_data):
    sample_expense_data["seller"] = "  Louis  "
    expense = ExpenseRequest(**sample_expense_data)
    assert expense.seller == "Louis"


def test_blank_marketplace_coerced_to_none(sample_expense_data):
    sample_expense_data["marketplace"] = "   "
    expense = ExpenseRequest(**sample_expense_data)
    assert expense.marketplace is None


@pytest.mark.parametrize(
    "field, value",
    [
        ("amount", -1),
        ("amount", 0),
        ("quantity", 0),
        ("quantity", -1),
        ("seller", ""),
        ("seller", "   "),
        ("product", ""),
        ("series", ""),
        ("item_type", ""),
        ("date", "not-a-date"),
    ],
)
def test_invalid_field_raises(sample_expense_data, field, value):
    sample_expense_data[field] = value
    with pytest.raises(ValidationError):
        ExpenseRequest(**sample_expense_data)
