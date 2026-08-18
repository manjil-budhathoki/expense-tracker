from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Enum as SqlEnum
from sqlalchemy.orm import relationship
from src.core.database import Base
from src.schemas.schema import TransactionType


class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)


class ExpenseModel(Base):
    __tablename__ = "expenses"

    id = Column(Integer, primary_key=True, autoincrement=True)
    amount = Column(Float, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    type = Column(SqlEnum(TransactionType), nullable=False, default=TransactionType.expense)
    note = Column(String, nullable=True)
    date = Column(Date, nullable=False)

    category = relationship("CategoryModel")