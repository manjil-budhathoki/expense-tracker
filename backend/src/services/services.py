from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from src.models.model import ExpenseModel
from src.schemas.schema import ExpenseCreate, ExpenseUpdate


async def create_expense(db: AsyncSession, expense: ExpenseCreate):
    db_expense = ExpenseModel(**expense.model_dump())
    db.add(db_expense)
    await db.commit()
    await db.refresh(db_expense)
    return db_expense


async def get_expense(db: AsyncSession, expense_id: int):
    result = await db.execute(select(ExpenseModel).where(ExpenseModel.id == expense_id))
    return result.scalar_one_or_none()


async def get_expenses(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(select(ExpenseModel).offset(skip).limit(limit))
    return result.scalars().all()


async def update_expense(db: AsyncSession, expense_id: str, expense: ExpenseUpdate):
    db_expense = await get_expense(db, expense_id)
    if not db_expense:
        return None
    for key, value in expense.model_dump(exclude_unset=True).items():
        setattr(db_expense, key, value)
    await db.commit()
    await db.refresh(db_expense)
    return db_expense


async def delete_expense(db: AsyncSession, expense_id: int):
    db_expense = await get_expense(db, expense_id)
    if not db_expense:
        return None
    await db.delete(db_expense)
    await db.commit()
    return db_expense