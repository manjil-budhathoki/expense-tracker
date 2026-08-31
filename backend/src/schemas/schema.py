from pydantic import BaseModel, Field, field_validator, EmailStr
import datetime
from enum import Enum
from typing import Optional


class TransactionType(str, Enum):
    expense = "expense"
    saving = "saving"

class PaymentMethod(str, Enum):
    cash = "Cash"
    nabil_bank = "Nabil bank"
    nimb_bank = "NIMB Bank"
    card = "Card"
    esewa ="E-sewa"

class CategoryBase(BaseModel):
    name: str = Field(..., min_length=1)

class CategoryCreate(CategoryBase):
    pass

class Category(CategoryBase):
    id: int
    class Config:
        from_attributes = True

class ExpenseBase(BaseModel):
    amount: float = Field(..., gt=0)
    category_id: int
    type: TransactionType = TransactionType.expense
    note: Optional[str] = None
    payment_method: PaymentMethod = PaymentMethod.cash
    date: datetime.date = Field(default_factory=datetime.date.today)

class ExpenseCreate(ExpenseBase):
    pass

class ExpenseUpdate(BaseModel):
    amount: Optional[float] = Field(default=None, gt=0)
    category_id: Optional[int] = None
    type: Optional[TransactionType] = None
    payment_method: Optional[PaymentMethod] = None
    note: Optional[str] = None
    date: Optional[datetime.date] = None

class Expense(ExpenseBase):
    id: int
    class Config:
        from_attributes = True

class PaginatedExpenses(BaseModel):
    total: int
    skip: int
    limit: int
    items: list[Expense]

class CategorySummary(BaseModel):
    category_id: int
    category_name: str
    type: TransactionType
    total: float

class SummaryResponse(BaseModel):
    total_expense: float
    total_saving: float
    net: float
    by_category: list[CategorySummary]

class ExportFormat(str, Enum):
    csv = "csv"
    xlsx = "xlsx"
    pdf = "pdf"

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3)
    email: str
    password: str = Field(..., min_length=6)


class UserOut(BaseModel):
    id: int
    username: str
    email: str

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

# schemas/schema.py
class InviteCreate(BaseModel):
    email: EmailStr
    can_add_expense: bool = True
    can_edit_expense: bool = False
    can_delete_expense: bool = False
    can_export: bool = False
    can_import: bool = False
    can_manage_categories: bool = False
    can_invite_users: bool = False


class InviteAccept(BaseModel):
    username: str = Field(..., min_length=3)
    password: str = Field(..., min_length=8)