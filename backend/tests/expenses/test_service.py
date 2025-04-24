from expenses.service import (
    create_expense_service,
    read_expenses_service,
    update_expense_service,
    delete_expense_service
)


def test_create_expense_service(mock_db, expense_factory):
    expense = expense_factory()
    create_expense_service(mock_db, "mock-uid", expense)


def test_read_expenses_service(mock_db):
    mock_db.collection().where().stream.return_value = []
    read_expenses_service(mock_db, "mock-uid", product="Pokémon")


def test_update_expense_service(mock_db, expense_factory):
    expense = expense_factory()
    update_expense_service(mock_db, "mock-uid", "some-id", expense)


def test_delete_expense_service(mock_db):
    delete_expense_service(mock_db, "mock-uid", "some-id")
