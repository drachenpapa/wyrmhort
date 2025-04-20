from __future__ import annotations

import os
from datetime import datetime

import firebase_admin
from firebase_admin import credentials, firestore

from expenses.models import Expense


def init_firestore():
    key_path = os.path.join(os.path.dirname(__file__), '..', '..', 'secrets', 'firebase-key.json')
    cred = credentials.Certificate(os.path.abspath(key_path))
    firebase_admin.initialize_app(cred)
    return firestore.client()


def get_expenses(
        db: firestore.Client,
        category: str | None = None,
        marketplace: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None
):
    expenses_ref = db.collection("expenses")

    if start_date and end_date:
        expenses_ref = expenses_ref.where("date", ">=", start_date).where("date", "<=", end_date)
    if category:
        expenses_ref = expenses_ref.where("product", "==", category)  # angepasst auf "product"
    if marketplace:
        expenses_ref = expenses_ref.where("marketplace", "==", marketplace)

    expenses = expenses_ref.stream()

    result = []
    for doc in expenses:
        expense_data = doc.to_dict()
        expense = Expense(
            amount=expense_data["amount"],
            quantity=expense_data["quantity"],
            marketplace=expense_data.get("marketplace"),
            seller=expense_data["seller"],
            product=expense_data["product"],
            item_type=expense_data["item_type"],
            series=expense_data["series"],
            date=datetime.fromisoformat(expense_data["date"])
        )
        result.append(expense)

    return result


def add_expense(db: firestore.Client, expense: Expense):
    doc_ref = db.collection("expenses").document()
    doc_ref.set({
        "date": expense.date.isoformat(),
        "amount": expense.amount,
        "quantity": expense.quantity,
        "marketplace": expense.marketplace,
        "seller": expense.seller,
        "product": expense.product,
        "item_type": expense.item_type,
        "series": expense.series
    })
    print(f"Expense added with ID: {doc_ref.id}")


def update_expense(db: firestore.Client, expense_id: str, updated_expense: Expense):
    doc_ref = db.collection("expenses").document(expense_id)
    doc_ref.update({
        "amount": updated_expense.amount,
        "quantity": updated_expense.quantity,
        "marketplace": updated_expense.marketplace,
        "seller": updated_expense.seller,
        "product": updated_expense.product,
        "item_type": updated_expense.item_type,
        "series": updated_expense.series,
        "date": updated_expense.date.isoformat()
    })
    print(f"Expense with ID: {expense_id} updated.")


def delete_expense(db: firestore.Client, expense_id: str):
    doc_ref = db.collection("expenses").document(expense_id)
    doc_ref.delete()
    print(f"Expense with ID: {expense_id} deleted.")
