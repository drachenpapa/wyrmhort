from __future__ import annotations

import os
from datetime import datetime

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

    results = []
    for doc in docs:
        data = doc.to_dict()
        results.append(Expense(
            date=datetime.fromisoformat(data["date"]),
            amount=data["amount"],
            quantity=data["quantity"],
            product=data["product"],
            item_type=data["item_type"],
            series=data["series"],
            seller=data["seller"],
            marketplace=data.get("marketplace"),
        ))

    return results


def add_expense(db, uid, expense):
    doc_ref = db.collection("users").document(uid).collection("expenses").document()
    doc_ref.set({
        "date": expense.date.isoformat(),
        "amount": expense.amount,
        "product": expense.product,
        "item_type": expense.item_type,
        "series": expense.series,
        "quantity": expense.quantity,
        "seller": expense.seller,
        "marketplace": expense.marketplace
    })
    print(f"Expense added with ID: {doc_ref.id}")
    return doc_ref.id


def update_expense(db, uid, expense_id, updated_expense):
    doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
    doc_ref.update({
        "date": updated_expense.date.isoformat(),
        "amount": updated_expense.amount,
        "product": updated_expense.product,
        "item_type": updated_expense.item_type,
        "series": updated_expense.series,
        "quantity": updated_expense.quantity,
        "seller": updated_expense.seller,
        "marketplace": updated_expense.marketplace
    })
    print(f"Expense with ID: {expense_id} updated.")


def delete_expense(db, uid, expense_id):
    doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
    doc_ref.delete()
    print(f"Expense with ID: {expense_id} deleted.")
