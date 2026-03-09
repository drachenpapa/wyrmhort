from __future__ import annotations

from datetime import datetime

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from starlette.responses import JSONResponse

from expenses.schemas import ExpenseRequest
from expenses.service import (
    create_expense_service,
    delete_expense_service,
    read_expenses_service,
    update_expense_service,
)
from firebase.auth import get_current_user_uid
from firebase.firestore import init_firestore

app = FastAPI(
    title="Wyrmhort Expense API",
    version="0.1.0",
    description="Personal expense tracking API for hobby collectibles",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=[
        {
            "name": "health",
            "description": "Health check endpoints",
        },
        {
            "name": "expenses",
            "description": "CRUD operations for expense tracking",
        },
    ],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "https://wyrmhort.web.app",
        "https://wyrmhort.firebaseapp.com",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    return init_firestore()


@app.get("/health", tags=["health"])
async def health_check():
    return JSONResponse(content={"status": "healthy"}, status_code=200)


@app.post("/api/expenses/", tags=["expenses"])
async def create_expense(expense: ExpenseRequest, db=Depends(get_db), uid=Depends(get_current_user_uid)):
    """
    Add a new expense to the user's collection.
    """
    expense_id = create_expense_service(db, uid, expense)
    return {"message": "Expense added successfully", "id": expense_id}


@app.get("/api/expenses/", tags=["expenses"])
async def read_expenses(
    product: str | None = None,
    item_type: str | None = None,
    series: str | None = None,
    seller: str | None = None,
    marketplace: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    sort: str = Query("-date"),
    db=Depends(get_db),
    uid=Depends(get_current_user_uid),
):
    """
    Retrieve all expenses for the user, optionally filtered by product, type, or series.
    """
    expenses = read_expenses_service(
        db,
        uid,
        product=product,
        item_type=item_type,
        series=series,
        seller=seller,
        marketplace=marketplace,
        start_date=start_date,
        end_date=end_date,
        sort=sort,
    )
    return {"expenses": [e.model_dump() for e in expenses]}


@app.put("/api/expenses/{expense_id}", tags=["expenses"])
async def update_expense(
    expense_id: str, expense: ExpenseRequest, db=Depends(get_db), uid=Depends(get_current_user_uid)
):
    """
    Modify an existing expense.
    """
    update_expense_service(db, uid, expense_id, expense)
    return {"message": f"Expense with ID {expense_id} updated."}


@app.delete("/api/expenses/{expense_id}", tags=["expenses"])
async def delete_expense(expense_id: str, db=Depends(get_db), uid=Depends(get_current_user_uid)):
    """
    Remove a specific expense entry.
    """
    delete_expense_service(db, uid, expense_id)
    return {"message": f"Expense with ID {expense_id} deleted."}
