from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Enum as SqlEnum, DateTime
from sqlalchemy.orm import relationship
from src.core.database import Base
from src.schemas.schema import TransactionType, PaymentMethod
import datetime

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
    payment_method = Column(SqlEnum(PaymentMethod), nullable=False, default=PaymentMethod.cash)
    note = Column(String, nullable=True)
    date = Column(Date, nullable=False)

    category = relationship("CategoryModel")

class ExportFileModel(Base):
    __tablename__ = "export_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    file_path = Column(String, nullable=False)
    format = Column(String, nullable=False)      # csv / xlsx / pdf
    view = Column(String, nullable=False)         # detail / summary
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ImportFileModel(Base):
    __tablename__ = "import_files"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    file_path = Column(String, nullable=False)
    format = Column(String, nullable=False)        # csv / xlsx
    rows_created = Column(Integer, default=0)
    uploaded_at = Column(DateTime, default=datetime.datetime.utcnow)