import enum

from sqlalchemy import Column, Integer, Float, String, Date, ForeignKey, Enum as SqlEnum, DateTime, Boolean
from sqlalchemy.orm import relationship
from src.core.database import Base
from src.schemas.schema import TransactionType, PaymentMethod
import datetime
import secrets

class CategoryModel(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, unique=True, nullable=False)
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    creator = relationship("UserModel")

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
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

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

class AccessLevel(str, enum.Enum):
    admin = "admin"
    editor = "editor"
    viewer = "viewer"


class UserModel(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    access_level = Column(SqlEnum(AccessLevel), nullable=False, default=AccessLevel.viewer)

class NotificationModel(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # null until the invited person actually has an account
    invite_id = Column(Integer, ForeignKey("invites.id"), nullable=True)
    type = Column(String, nullable=False)  # "invite", later could be others
    message = Column(String, nullable=False)
    status = Column(String, default="pending")  # pending / accepted / declined
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class InviteModel(Base):
    __tablename__ = "invites"

    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String, nullable=False)
    token = Column(String, unique=True, nullable=False, default=lambda: secrets.token_urlsafe(32))
    invited_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    access_level = Column(SqlEnum(AccessLevel), nullable=False, default=AccessLevel.editor)
    status = Column(String, default="pending")  # pending / accepted / declined / expired
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    action = Column(String, nullable=False)       # "created" / "deleted" / "updated"
    entity_type = Column(String, nullable=False)   # "expense" / "category"
    entity_id = Column(Integer, nullable=False)
    entity_summary = Column(String, nullable=True)  # e.g. "Food - $450" so it's readable after deletion
    performed_by = Column(Integer, ForeignKey("users.id"), nullable=False)
    performed_at = Column(DateTime, default=datetime.datetime.utcnow)