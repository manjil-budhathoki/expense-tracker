from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.database import get_db
from src.schemas.schema import Expense, ExpenseCreate, ExpenseUpdate
from src.services import services

router = APIRouter(prefix="/expenses", tags=["expenses"])


@router.post("/", response_model=Expense)
async def create_expense(expense: ExpenseCreate, db: AsyncSession = Depends(get_db)):
    return await services.create_expense(db, expense)


@router.get("/", response_model=list[Expense])
async def list_expenses(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    return await services.get_expenses(db, skip, limit)


@router.get("/{expense_id}", response_model=Expense)
async def read_expense(expense_id: int, db: AsyncSession = Depends(get_db)):
    result = await services.get_expense(db, expense_id)
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    return result


@router.put("/{expense_id}", response_model=Expense)
async def update_expense(expense_id: int, expense: ExpenseUpdate, db: AsyncSession = Depends(get_db)):
    result = await services.update_expense(db, expense_id, expense)
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    return result


@router.delete("/{expense_id}")
async def delete_expense(expense_id: int, db: AsyncSession = Depends(get_db)):
    result = await services.delete_expense(db, expense_id)
    if not result:
        raise HTTPException(status_code=404, detail="Expense not found")
    return {"detail": "Deleted successfully"}