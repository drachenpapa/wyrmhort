from __future__ import annotations

from firebase.firestore import add_expense, get_expenses, update_expense, delete_expense


def create_expense_service(db, uid, expense):
    add_expense(db, uid, expense)


def read_expenses_service(db, uid, category=None, marketplace=None, start_date=None, end_date=None):
    return get_expenses(db, uid, category, marketplace, start_date, end_date)


def update_expense_service(db, uid, expense_id, updated_expense):
    update_expense(db, uid, expense_id, updated_expense)


def delete_expense_service(db, uid, expense_id):
    delete_expense(db, uid, expense_id)
