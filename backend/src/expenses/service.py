from datetime import datetime, time as dt_time
from typing import Final

from google.cloud.firestore import Client

from expenses.models import Expense, ExpenseQuery
from expenses.schemas import ExpenseRequest, ExpenseResponse
from firebase.firestore import add_expense, delete_expense, get_expenses, update_expense
from logger_config import setup_logger

logger = setup_logger(__name__)

ALLOWED_SORT_FIELDS: Final[frozenset[str]] = frozenset(
    {"date", "amount", "product", "item_type", "series", "seller", "marketplace", "quantity"}
)


def create_expense_service(db: Client, uid: str, expense: ExpenseRequest) -> ExpenseResponse:
    """Create a new expense and return the full created resource."""
    domain = _to_domain(expense, expense_id="")
    expense_id = add_expense(db, uid, domain)
    return ExpenseResponse.model_validate(_to_domain(expense, expense_id=expense_id))


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
    sort: str = "-date",
) -> list[ExpenseResponse]:
    """Retrieve expenses with optional filtering and sorting."""
    if sort.startswith("-"):
        order_by, ascending = sort[1:], False
    else:
        order_by, ascending = sort, True

    if order_by not in ALLOWED_SORT_FIELDS:
        logger.warning(f"Invalid sort field '{order_by}', defaulting to 'date'")
        order_by, ascending = "date", False

    # If end_date is at midnight (date-only query from the UI), extend to end of day
    # so that expenses on that calendar day are included regardless of time component.
    if end_date is not None and end_date.time() == dt_time(0, 0, 0):
        end_date = end_date.replace(hour=23, minute=59, second=59, microsecond=999999)

    expenses = get_expenses(
        db,
        uid,
        ExpenseQuery(
            product=product,
            item_type=item_type,
            series=series,
            seller=seller,
            marketplace=marketplace,
            start_date=start_date,
            end_date=end_date,
            order_by=order_by,
            ascending=ascending,
        ),
    )
    return [ExpenseResponse.model_validate(e) for e in expenses]


def update_expense_service(db: Client, uid: str, expense_id: str, expense: ExpenseRequest) -> None:
    """Update an existing expense."""
    update_expense(db, uid, expense_id, _to_domain(expense, expense_id=expense_id))


def delete_expense_service(db: Client, uid: str, expense_id: str) -> None:
    """Delete an expense by ID."""
    delete_expense(db, uid, expense_id)


def _to_domain(expense: ExpenseRequest, *, expense_id: str) -> Expense:
    """Convert an ExpenseRequest schema into the Expense domain model."""
    return Expense(
        id=expense_id,
        date=expense.date,
        amount=expense.amount,
        quantity=expense.quantity,
        marketplace=expense.marketplace,
        seller=expense.seller,
        product=expense.product,
        item_type=expense.item_type,
        series=expense.series,
    )
