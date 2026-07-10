from pathlib import Path
from typing import cast

import firebase_admin
from firebase_admin import credentials, firestore
from google.api_core.exceptions import GoogleAPIError
from google.cloud.firestore import Client, FieldFilter

from expenses.models import Expense, ExpenseQuery
from logger_config import setup_logger

logger = setup_logger(__name__)


def init_firestore() -> Client:
    try:
        firebase_admin.get_app()
    except ValueError:
        key_path = Path(__file__).parents[2] / "secrets" / "firebase-key.json"
        cred = credentials.Certificate(str(key_path.resolve()))
        firebase_admin.initialize_app(cred)
        logger.info("Firebase app initialized.")
    return cast(Client, firestore.client())


def get_expenses(db: Client, uid: str, query: ExpenseQuery) -> list[Expense]:
    try:
        expenses_ref = db.collection("users").document(uid).collection("expenses")

        if query.start_date:
            expenses_ref = expenses_ref.where(filter=FieldFilter("date", ">=", query.start_date.isoformat()))
        if query.end_date:
            expenses_ref = expenses_ref.where(filter=FieldFilter("date", "<=", query.end_date.isoformat()))

        for field_name, value in (
            ("product", query.product),
            ("item_type", query.item_type),
            ("series", query.series),
            ("seller", query.seller),
            ("marketplace", query.marketplace),
        ):
            if value is not None:
                expenses_ref = expenses_ref.where(filter=FieldFilter(field_name, "==", value))

        direction = "ASCENDING" if query.ascending else "DESCENDING"
        expenses_ref = expenses_ref.order_by(query.order_by, direction=direction)
        return [Expense.from_firestore(doc.to_dict(), doc.id) for doc in expenses_ref.stream()]
    except GoogleAPIError as e:
        logger.error(f"Failed to get expenses: {e}")
        raise


def add_expense(db: Client, uid: str, expense: Expense) -> str:
    try:
        doc_ref = db.collection("users").document(uid).collection("expenses").document()
        doc_ref.set(expense.to_firestore())
        doc_id: str = doc_ref.id
        logger.info(f"Expense added with ID: {doc_id}")
        return doc_id
    except GoogleAPIError as e:
        logger.error(f"Failed to add expense: {e}")
        raise


def update_expense(db: Client, uid: str, expense_id: str, updated_expense: Expense) -> None:
    try:
        doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
        doc_ref.update(updated_expense.to_firestore())
        logger.info(f"Expense with ID: {expense_id} updated.")
    except GoogleAPIError as e:
        logger.error(f"Failed to update expense {expense_id}: {e}")
        raise


def delete_expense(db: Client, uid: str, expense_id: str) -> None:
    try:
        doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
        doc_ref.delete()
        logger.info(f"Expense with ID: {expense_id} deleted.")
    except GoogleAPIError as e:
        logger.error(f"Failed to delete expense {expense_id}: {e}")
        raise
