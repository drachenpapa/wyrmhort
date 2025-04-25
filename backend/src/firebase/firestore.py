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


def get_expenses(db, uid, product=None, item_type=None, series=None,
                 seller=None, marketplace=None, start_date=None, end_date=None):
    expenses_ref = db.collection("users").document(uid).collection("expenses")

    if start_date:
        expenses_ref = expenses_ref.where("date", ">=", start_date.isoformat())
    if end_date:
        expenses_ref = expenses_ref.where("date", "<=", end_date.isoformat())
    if product:
        expenses_ref = expenses_ref.where("product", "==", product)
    if item_type:
        expenses_ref = expenses_ref.where("item_type", "==", item_type)
    if series:
        expenses_ref = expenses_ref.where("series", "==", series)
    if seller:
        expenses_ref = expenses_ref.where("seller", "==", seller)
    if marketplace:
        expenses_ref = expenses_ref.where("marketplace", "==", marketplace)

    expenses_ref = expenses_ref.order_by("date", direction=firestore.Query.ASCENDING)
    expenses = expenses_ref.stream()

    result = []
    for doc in expenses:
        data = doc.to_dict()
        result.append(Expense(
            date=datetime.fromisoformat(data["date"]),
            amount=data["amount"],
            product=data["product"],
            item_type=data["item_type"],
            series=data["series"],
            quantity=data["quantity"],
            seller=data["seller"],
            marketplace=data.get("marketplace")
        ))
    return result


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
