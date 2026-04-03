from pathlib import Path

import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud.firestore import Client, FieldFilter

from expenses.models import Expense
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
    return firestore.client()


def get_expenses(db: Client, uid: str, **filters) -> list[Expense]:
    try:
        order_by: str = filters.pop("order_by", "date")
        ascending: bool = filters.pop("ascending", False)
        start_date = filters.pop("start_date", None)
        end_date = filters.pop("end_date", None)

        expenses_ref = db.collection("users").document(uid).collection("expenses")

        if start_date:
            expenses_ref = expenses_ref.where(filter=FieldFilter("date", ">=", start_date.isoformat()))
        if end_date:
            expenses_ref = expenses_ref.where(filter=FieldFilter("date", "<=", end_date.isoformat()))

        for key, value in filters.items():
            if value is not None:
                expenses_ref = expenses_ref.where(filter=FieldFilter(key, "==", value))

        expenses_ref = expenses_ref.order_by(order_by, direction="ASCENDING" if ascending else "DESCENDING")
        return [Expense.from_firestore(doc.to_dict(), doc.id) for doc in expenses_ref.stream()]
    except Exception as e:
        logger.error(f"Failed to get expenses: {e}")
        raise


def add_expense(db: Client, uid: str, expense: Expense) -> str:
    try:
        doc_ref = db.collection("users").document(uid).collection("expenses").document()
        doc_ref.set(expense.to_firestore())
        logger.info(f"Expense added with ID: {doc_ref.id}")
        return doc_ref.id
    except Exception as e:
        logger.error(f"Failed to add expense: {e}")
        raise


def update_expense(db: Client, uid: str, expense_id: str, updated_expense: Expense) -> None:
    try:
        doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
        doc_ref.update(updated_expense.to_firestore())
        logger.info(f"Expense with ID: {expense_id} updated.")
    except Exception as e:
        logger.error(f"Failed to update expense {expense_id}: {e}")
        raise


def delete_expense(db: Client, uid: str, expense_id: str) -> None:
    try:
        doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
        doc_ref.delete()
        logger.info(f"Expense with ID: {expense_id} deleted.")
    except Exception as e:
        logger.error(f"Failed to delete expense {expense_id}: {e}")
        raise
