import os
from datetime import datetime
from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from google.api_core.exceptions import NotFound
from google.cloud.firestore import Client
from starlette.responses import JSONResponse

from expenses.schemas import (
    ExpenseRequest,
    ExpenseResponse,
    ExpensesListResponse,
    MessageResponse,
)
from expenses.service import (
    create_expense_service,
    delete_expense_service,
    read_expenses_service,
    update_expense_service,
)
from firebase.auth import get_current_user_uid
from firebase.firestore import init_firestore

_ENVIRONMENT = os.environ.get("ENVIRONMENT", "development")

app = FastAPI(
    title="Wyrmhort Expense API",
    version="0.1.0",
    description="Personal expense tracking API for hobby collectibles",
    docs_url=None if _ENVIRONMENT == "production" else "/docs",
    redoc_url=None if _ENVIRONMENT == "production" else "/redoc",
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

DB = Annotated[Client, Depends(init_firestore)]
CurrentUser = Annotated[str, Depends(get_current_user_uid)]


@app.get("/health", tags=["health"])
async def health_check() -> JSONResponse:
    return JSONResponse(content={"status": "healthy"}, status_code=200)


@app.post("/api/expenses/", response_model=ExpenseResponse, status_code=201, tags=["expenses"])
async def create_expense(expense: ExpenseRequest, db: DB, uid: CurrentUser) -> ExpenseResponse:
    """Add a new expense to the user's collection."""
    return create_expense_service(db, uid, expense)


@app.get("/api/expenses/", response_model=ExpensesListResponse, tags=["expenses"])
async def read_expenses(
    db: DB,
    uid: CurrentUser,
    product: str | None = None,
    item_type: str | None = None,
    series: str | None = None,
    seller: str | None = None,
    marketplace: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    sort: str = Query("-date"),
) -> ExpensesListResponse:
    """Retrieve all expenses for the user, optionally filtered by product, type, or series."""
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
    return ExpensesListResponse(expenses=expenses)


@app.put("/api/expenses/{expense_id}", response_model=MessageResponse, tags=["expenses"])
async def update_expense(expense_id: str, expense: ExpenseRequest, db: DB, uid: CurrentUser) -> MessageResponse:
    """Modify an existing expense."""
    try:
        update_expense_service(db, uid, expense_id, expense)
    except NotFound:
        raise HTTPException(status_code=404, detail=f"Expense {expense_id} not found")
    return MessageResponse(message=f"Expense with ID {expense_id} updated.")


@app.delete("/api/expenses/{expense_id}", response_model=MessageResponse, tags=["expenses"])
async def delete_expense(expense_id: str, db: DB, uid: CurrentUser) -> MessageResponse:
    """Remove a specific expense entry."""
    delete_expense_service(db, uid, expense_id)
    return MessageResponse(message=f"Expense with ID {expense_id} deleted.")
