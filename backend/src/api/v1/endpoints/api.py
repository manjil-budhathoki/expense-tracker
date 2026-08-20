from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime
from src.core.database import get_db
from src.schemas.schema import Expense, ExpenseCreate, ExpenseUpdate,TransactionType, PaginatedExpenses,SummaryResponse
from src.services import services

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=Expense)
def create_expense(expense: ExpenseCreate, db: Session = Depends(get_db)):
    return services.create_expense(db, expense)

@router.get("/", response_model=PaginatedExpenses)
def list_expenses(
    skip: int = 0,
    limit: int = 100,
    category_id: int | None = None,
    type: TransactionType | None = None,
    start_date: datetime.date | None = None,
    end_date: datetime.date | None = None,
    db: Session = Depends(get_db),
):
    total, items = services.get_expenses(db, skip, limit, category_id, type, start_date, end_date)
    return PaginatedExpenses(total=total, skip=skip, limit=limit, items=items)

@router.get("/summary", response_model=SummaryResponse)
def get_summary(
    start_date: datetime.date | None = None,
    end_date: datetime.date | None = None,
    db: Session = Depends(get_db),
):
    return services.get_summary(db, start_date, end_date)

@router.get("/", response_model=list[Expense])
def list_expenses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return services.get_expenses(db, skip, limit)


@router.get("/{expense_id}", response_model=Expense)
def read_expense(expense_id: int, db: Session = Depends(get_db)):
    result = services.get_expense(db, expense_id)
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    return result


@router.put("/{expense_id}", response_model=Expense)
def update_expense(expense_id: int, expense: ExpenseUpdate, db: Session = Depends(get_db)):
    result = services.update_expense(db, expense_id, expense)
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    return result


@router.delete("/{expense_id}")
def delete_expense(expense_id: int, db: Session = Depends(get_db)):
    result = services.delete_expense(db, expense_id)
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"detail": "Deleted successfully"}