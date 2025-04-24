from __future__ import annotations

from datetime import datetime

from fastapi import FastAPI, Depends

from expenses.schemas import ExpenseRequest
from expenses.service import (
    create_expense_service,
    read_expenses_service,
    update_expense_service,
    delete_expense_service
)
from firebase.auth import get_current_user_uid
from firebase.firestore import init_firestore

app = FastAPI()


def get_db():
    return init_firestore()


@app.post("/api/expenses/")
async def create_expense(
        expense: ExpenseRequest,
        db=Depends(get_db),
        uid=Depends(get_current_user_uid)
):
    create_expense_service(db, uid, expense)
    return {"message": "Expense added successfully"}


@app.get("/api/expenses/")
async def read_expenses(
        product: str | None = None,
        item_type: str | None = None,
        series: str | None = None,
        seller: str | None = None,
        marketplace: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        db=Depends(get_db),
        uid=Depends(get_current_user_uid)
):
    expenses = read_expenses_service(
        db,
        uid,
        product=product,
        item_type=item_type,
        series=series,
        seller=seller,
        marketplace=marketplace,
        start_date=start_date,
        end_date=end_date
    )
    return {"expenses": expenses}


@app.put("/api/expenses/{expense_id}")
async def update_expense(
        expense_id: str,
        expense: ExpenseRequest,
        db=Depends(get_db),
        uid=Depends(get_current_user_uid)
):
    update_expense_service(db, uid, expense_id, expense)
    return {"message": f"Expense with ID {expense_id} updated."}


@app.delete("/api/expenses/{expense_id}")
async def delete_expense(
        expense_id: str,
        db=Depends(get_db),
        uid=Depends(get_current_user_uid)
):
    delete_expense_service(db, uid, expense_id)
    return {"message": f"Expense with ID {expense_id} deleted."}
