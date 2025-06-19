from __future__ import annotations

from datetime import datetime

from google.cloud.firestore import Client

from expenses.models import Expense
from expenses.schemas import ExpenseRequest, ExpenseResponse
from firebase.firestore import add_expense, get_expenses, update_expense, delete_expense
from logger_config import setup_logger

logger = setup_logger(__name__)
ALLOWED_SORT_FIELDS = {"date", "amount", "product", "item_type", "series", "seller", "marketplace"}


def create_expense_service(db: Client, uid: str, expense: ExpenseRequest) -> str:
    expense_obj = __convert(expense, id="")
    return add_expense(db, uid, expense_obj)


def read_expenses_service(
        db: Client,
        uid: str,
        product: str | None = None,
        item_type: str | None = None,
        series: str | None = None,
        seller: str | None = None,
        marketplace: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        sort: str = "-date"
) -> list[ExpenseResponse]:
    if sort.startswith("-"):
        order_by = sort[1:]
        ascending = False
    else:
        order_by = sort
        ascending = True
    if order_by not in ALLOWED_SORT_FIELDS:
        logger.warning(f"Invalid sort field '{order_by}', defaulting to 'date'")
        order_by = "date"
        ascending = False

    expenses = get_expenses(
        db,
        uid,
        product=product,
        item_type=item_type,
        series=series,
        seller=seller,
        marketplace=marketplace,
        start_date=start_date,
        end_date=end_date,
        order_by=order_by,
        ascending=ascending
    )
    return [ExpenseResponse.model_validate(e) for e in expenses]


def update_expense_service(db: Client, uid: str, expense_id: str, expense: ExpenseRequest) -> None:
    updated_expense = __convert(expense, id=expense_id)
    update_expense(db, uid, expense_id, updated_expense)


def delete_expense_service(db: Client, uid: str, expense_id: str) -> None:
    delete_expense(db, uid, expense_id)


def __convert(expense: ExpenseRequest, id: str) -> Expense:
    return Expense(
        id=id,
        date=expense.date,
        amount=float(expense.amount),
        quantity=expense.quantity,
        marketplace=expense.marketplace,
        seller=expense.seller,
        product=expense.product,
        item_type=expense.item_type,
        series=expense.series
    )
