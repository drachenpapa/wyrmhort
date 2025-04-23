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


def get_expenses(db, uid, category=None, marketplace=None, start_date=None, end_date=None):
    expenses_ref = db.collection("users").document(uid).collection("expenses")

    if start_date and end_date:
        expenses_ref = expenses_ref.where("date", ">=", start_date).where("date", "<=", end_date)
    if category:
        expenses_ref = expenses_ref.where("product", "==", category)
    if marketplace:
        expenses_ref = expenses_ref.where("marketplace", "==", marketplace)

    expenses = expenses_ref.stream()
    result = []
    for doc in expenses:
        data = doc.to_dict()
        result.append(Expense(
            amount=data["amount"],
            quantity=data["quantity"],
            marketplace=data.get("marketplace"),
            seller=data["seller"],
            product=data["product"],
            item_type=data["item_type"],
            series=data["series"],
            date=datetime.fromisoformat(data["date"])
        ))
    return result


def add_expense(db, uid, expense):
    doc_ref = db.collection("users").document(uid).collection("expenses").document()
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


def update_expense(db, uid, expense_id, updated_expense):
    doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
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


def delete_expense(db, uid, expense_id):
    doc_ref = db.collection("users").document(uid).collection("expenses").document(expense_id)
    doc_ref.delete()
    print(f"Expense with ID: {expense_id} deleted.")
