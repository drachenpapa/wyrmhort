from datetime import datetime

from expenses.models import Expense
from firestore.client import add_expense, get_expenses, update_expense, delete_expense


def create_expense_service(db, expense: Expense):
    add_expense(db, expense)


def read_expenses_service(db, category: str = None, marketplace: str = None, start_date: datetime = None,
                          end_date: datetime = None):
    return get_expenses(db, category, marketplace, start_date, end_date)


def update_expense_service(db, expense_id: str, updated_expense: Expense):
    update_expense(db, expense_id, updated_expense)


def delete_expense_service(db, expense_id: str):
    delete_expense(db, expense_id)
