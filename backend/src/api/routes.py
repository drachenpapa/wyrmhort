from datetime import datetime
from typing import Annotated, Literal

from fastapi import Depends, FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from google.cloud.firestore import Client
from pydantic import BaseModel

from expenses.schemas import (
    CreateExpenseResponse,
    ExpenseRequest,
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


class HealthResponse(BaseModel):
    """Response model for the health check endpoint."""

    status: Literal["healthy"]


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

DB = Annotated[Client, Depends(init_firestore)]
CurrentUser = Annotated[str, Depends(get_current_user_uid)]


@app.get("/health", response_model=HealthResponse, tags=["health"])
def health_check() -> HealthResponse:
    return HealthResponse(status="healthy")


@app.post("/api/expenses/", response_model=CreateExpenseResponse, status_code=201, tags=["expenses"])
def create_expense(expense: ExpenseRequest, db: DB, uid: CurrentUser) -> CreateExpenseResponse:
    """Add a new expense to the user's collection."""
    expense_id = create_expense_service(db, uid, expense)
    return CreateExpenseResponse(message="Expense added successfully", id=expense_id)


@app.get("/api/expenses/", response_model=ExpensesListResponse, tags=["expenses"])
def read_expenses(
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
def update_expense(expense_id: str, expense: ExpenseRequest, db: DB, uid: CurrentUser) -> MessageResponse:
    """Modify an existing expense."""
    update_expense_service(db, uid, expense_id, expense)
    return MessageResponse(message=f"Expense with ID {expense_id} updated.")


@app.delete("/api/expenses/{expense_id}", response_model=MessageResponse, tags=["expenses"])
def delete_expense(expense_id: str, db: DB, uid: CurrentUser) -> MessageResponse:
    """Remove a specific expense entry."""
    delete_expense_service(db, uid, expense_id)
    return MessageResponse(message=f"Expense with ID {expense_id} deleted.")
