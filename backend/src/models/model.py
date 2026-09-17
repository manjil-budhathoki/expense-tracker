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
    payment_method = Column(
        SqlEnum(
            PaymentMethod,
            values_callable=lambda enum_cls: [member.value for member in enum_cls]
        ),
        nullable=False,
        default=PaymentMethod.cash
    )
    note = Column(String, nullable=True)
    date = Column(Date, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    category = relationship("CategoryModel")
    creator = relationship("UserModel")

    @property
    def created_by_name(self):
        return self.creator.name if self.creator else None

class UserModel(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    password_hash = Column(String(255), nullable=False)

class SessionModel(Base):
    __tablename__ = "sessions"
    token_hash = Column(String(64), primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    user = relationship("UserModel")

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
