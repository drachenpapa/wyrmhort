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
from firestore.client import init_firestore

app = FastAPI()


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


@app.post("/expenses/")
async def create_expense(
        expense: ExpenseRequest,
        db=Depends(get_db)
):
    expense_obj = Expense(
        amount=expense.amount,
        quantity=expense.quantity,
        marketplace=expense.marketplace,
        seller=expense.seller,
        product=expense.product,
        item_type=expense.item_type,
        series=expense.series,
        date=expense.date
    )
    create_expense_service(db, expense_obj)
    return {"message": "Expense added successfully"}


@app.get("/expenses/")
async def read_expenses(
        category: str = None,
        marketplace: str = None,
        start_date: datetime = None,
        end_date: datetime = None,
        db=Depends(get_db)
):
    expenses = read_expenses_service(db, category, marketplace, start_date, end_date)
    return {"expenses": expenses}


@app.put("/expenses/{expense_id}")
async def update_expense(
        expense_id: str,
        expense: ExpenseRequest,
        db=Depends(get_db)
):
    updated_expense = Expense(
        amount=expense.amount,
        quantity=expense.quantity,
        marketplace=expense.marketplace,
        seller=expense.seller,
        product=expense.product,
        item_type=expense.item_type,
        series=expense.series,
        date=expense.date
    )
    update_expense_service(db, expense_id, updated_expense)
    return {"message": f"Expense with ID {expense_id} updated."}


@app.delete("/expenses/{expense_id}")
async def delete_expense(
        expense_id: str,
        db=Depends(get_db)
):
    delete_expense_service(db, expense_id)
    return {"message": f"Expense with ID {expense_id} deleted."}
