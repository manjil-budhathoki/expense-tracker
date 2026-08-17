from pydantic import BaseModel, Field, field_validator
import datetime
from enum import Enum
from typing import Optional
import uuid


class TransactionType(str, Enum):
    expense = "expense"
    saving = "saving"


class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0)
    category: str = Field(..., min_length=1)
    type: TransactionType = TransactionType.expense
    note: Optional[str] = None
    date: datetime.date = Field(default_factory=datetime.date.today)


class ExpenseCreate(ExpenseBase):
    pass


class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(default=None, gt=0)
    category: Optional[str] = None
    type: Optional[TransactionType] = None
    note: Optional[str] = None
    date: Optional[datetime.date] = None


class Expense(ExpenseBase):
    id: int

    class Config:
        from_attributes = True