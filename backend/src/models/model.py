import uuid
from sqlalchemy import Column, Float, String, Date, Enum as SqlEnum,Integer
from sqlalchemy.dialects.postgresql import UUID

from src.core.database import Base
from src.schemas.schema import TransactionType


class ExpenseModel(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    category = Column(String, nullable=False)
    type = Column(SqlEnum(TransactionType), nullable=False, default=TransactionType.expense)
    note = Column(String, nullable=True)
    date = Column(Date, nullable=False)