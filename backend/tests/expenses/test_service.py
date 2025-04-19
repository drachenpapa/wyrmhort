from expenses.service import (
    create_expense_service,
    read_expenses_service,
    update_expense_service,
    delete_expense_service,
)


def test_create_expense_service(mock_db, expense_factory):
    expense = expense_factory()
    create_expense_service(mock_db, expense)
    mock_db.collection().document().set.assert_called_once()


def test_read_expenses_service(mock_db):
    mock_db.collection().where().stream.return_value = []
    read_expenses_service(mock_db, category="Pokémon")
    mock_db.collection().where().stream.assert_called_once()


def test_update_expense_service(mock_db, expense_factory):
    expense = expense_factory()
    update_expense_service(mock_db, "some-id", expense)
    mock_db.collection().document().update.assert_called_once()


def test_delete_expense_service(mock_db):
    delete_expense_service(mock_db, "some-id")
    mock_db.collection().document().delete.assert_called_once()
