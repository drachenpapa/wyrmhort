from __future__ import annotations

from datetime import datetime

from google.cloud.firestore import Client

from expenses.models import Expense
from expenses.schemas import ExpenseRequest
from firebase.firestore import add_expense, get_expenses, update_expense, delete_expense


def create_expense_service(db: Client, uid: str, expense: ExpenseRequest) -> None:
    expense_obj = __convert(expense)
    add_expense(db, uid, expense_obj)


def read_expenses_service(
        db: Client,
        uid: str,
        product: str | None = None,
        item_type: str | None = None,
        series: str | None = None,
        seller: str | None = None,
        marketplace: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None
) -> list[Expense]:
    return get_expenses(
        db,
        uid,
        product=product,
        item_type=item_type,
        series=series,
        seller=seller,
        marketplace=marketplace,
        start_date=start_date,
        end_date=end_date
    )


def update_expense_service(db: Client, uid: str, expense_id: str, expense: ExpenseRequest) -> None:
    updated_expense = __convert(expense)
    update_expense(db, uid, expense_id, updated_expense)


def delete_expense_service(db: Client, uid: str, expense_id: str) -> None:
    delete_expense(db, uid, expense_id)


def __convert(expense: ExpenseRequest) -> Expense:
    return Expense(
        date=expense.date,
        amount=float(expense.amount),
        quantity=expense.quantity,
        marketplace=expense.marketplace,
        seller=expense.seller,
        product=expense.product,
        item_type=expense.item_type,
        series=expense.series
    )
