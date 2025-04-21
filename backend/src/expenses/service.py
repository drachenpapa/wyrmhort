from __future__ import annotations

from datetime import datetime

from google.cloud.firestore import Client

from expenses.models import Expense
from firebase.firestore import add_expense, get_expenses, update_expense, delete_expense


def create_expense_service(db: Client, uid: str, expense: Expense) -> None:
    add_expense(db, uid, expense)


def read_expenses_service(
        db: Client,
        uid: str,
        category: str | None = None,
        marketplace: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None
) -> list[Expense]:
    return get_expenses(db, uid, category, marketplace, start_date, end_date)


def update_expense_service(db: Client, uid: str, expense_id: str, updated_expense: Expense) -> None:
    update_expense(db, uid, expense_id, updated_expense)


def delete_expense_service(db: Client, uid: str, expense_id: str) -> None:
    delete_expense(db, uid, expense_id)
