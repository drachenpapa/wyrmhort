from __future__ import annotations

import os

import firebase_admin
from firebase_admin import credentials, firestore

from expenses.models import Expense


def init_firestore():
    try:
        firebase_admin.get_app()
    except ValueError:
        key_path = os.path.join(os.path.dirname(__file__), '..', '..', 'secrets', 'firebase-key.json')
        cred = credentials.Certificate(os.path.abspath(key_path))
        firebase_admin.initialize_app(cred)

    return firestore.client()


def get_expenses(db, uid, **filters):
    order_by = filters.pop("order_by", "date")
    ascending = filters.pop("ascending", False)

    start_date = filters.pop("start_date", None)
    end_date = filters.pop("end_date", None)

    expenses_ref = db.collection("users").document(uid).collection("expenses")

    if start_date:
        expenses_ref = expenses_ref.where("date", ">=", start_date.isoformat())
    if end_date:
        expenses_ref = expenses_ref.where("date", "<=", end_date.isoformat())

    for key, value in filters.items():
        if value is not None:
            expenses_ref = expenses_ref.where(key, "==", value)

    expenses_ref = expenses_ref.order_by(order_by, direction="ASCENDING" if ascending else "DESCENDING")
    docs = expenses_ref.stream()
    return [Expense.from_firestore(doc.to_dict()) for doc in docs]


def add_expense(db, uid, expense):
    doc_ref = db.collection("users").document(uid).collection("expenses").document()
    doc_ref.set(expense.to_firestore())
    print(f"Expense added with ID: {doc_ref.id}")
    return doc_ref.id


def update_expense(db, uid, expense_id, updated_expense):
    doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
    doc_ref.update(updated_expense.to_firestore())
    print(f"Expense with ID: {expense_id} updated.")


def delete_expense(db, uid, expense_id):
    doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
    doc_ref.delete()
    print(f"Expense with ID: {expense_id} deleted.")
