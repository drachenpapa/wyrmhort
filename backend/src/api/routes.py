from __future__ import annotations

import logging
from datetime import datetime

from fastapi import FastAPI, Depends
from pydantic import BaseModel

from expenses.models import Expense
from expenses.service import (
    create_expense_service,
    read_expenses_service,
    update_expense_service,
    delete_expense_service
)
from firebase.auth import get_current_user_uid
from firebase.firestore import init_firestore

app = FastAPI()
logging.basicConfig(level=logging.INFO)


def get_db():
    return init_firestore()


class ExpenseRequest(BaseModel):
    date: datetime
    amount: float
    quantity: int
    marketplace: str | None = None
    seller: str
    product: str
    item_type: str
    series: str


@app.post("/api/expenses/")
async def create_expense(
        expense: ExpenseRequest,
        db=Depends(get_db),
        uid=Depends(get_current_user_uid)
):
    try:
        expense_obj = Expense(
            date=expense.date,
            amount=expense.amount,
            quantity=expense.quantity,
            marketplace=expense.marketplace,
            seller=expense.seller,
            product=expense.product,
            item_type=expense.item_type,
            series=expense.series
        )
        create_expense_service(db, uid, expense_obj)
        return {"message": "Expense added successfully"}
    except Exception as e:
        print(">>> ERROR:", e)
        raise


@app.get("/api/expenses/")
async def read_expenses(
        category: str | None = None,
        marketplace: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        db=Depends(get_db),
        uid=Depends(get_current_user_uid)
):
    try:
        expenses = read_expenses_service(db, uid, category, marketplace, start_date, end_date)
        return {"expenses": expenses}
    except Exception as e:
        print(">>> ERROR:", e)
        raise


@app.put("/api/expenses/{expense_id}")
async def update_expense(
        expense_id: str,
        expense: ExpenseRequest,
        db=Depends(get_db),
        uid=Depends(get_current_user_uid)
):
    try:
        updated_expense = Expense(
            date=expense.date,
            amount=expense.amount,
            quantity=expense.quantity,
            marketplace=expense.marketplace,
            seller=expense.seller,
            product=expense.product,
            item_type=expense.item_type,
            series=expense.series
        )
        update_expense_service(db, uid, expense_id, updated_expense)
        return {"message": f"Expense with ID {expense_id} updated."}
    except Exception as e:
        print(">>> ERROR:", e)
        raise


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(
        expense_id: str,
        db=Depends(get_db),
        uid=Depends(get_current_user_uid)
):
    try:
        delete_expense_service(db, uid, expense_id)
        return {"message": f"Expense with ID {expense_id} deleted."}
    except Exception as e:
        print(">>> ERROR:", e)
        raise
