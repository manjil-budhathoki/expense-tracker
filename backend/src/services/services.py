from sqlalchemy.orm import Session
from src.models.model import ExpenseModel, CategoryModel
from src.schemas.schema import ExpenseCreate, ExpenseUpdate, Optional, CategoryCreate, TransactionType, PaymentMethod
import datetime
from sqlalchemy import func


def create_expense(db: Session, expense: ExpenseCreate):
    db_expense = ExpenseModel(**expense.model_dump())
    db.add(db_expense)
    db.commit()
    db.refresh(db_expense)
    return db_expense

def get_expense(db: Session, expense_id: int):
    return db.query(ExpenseModel).filter(ExpenseModel.id == expense_id).first()

def create_category(db: Session, category: CategoryCreate):
    db_category = CategoryModel(**category.model_dump())
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

def get_categories(db: Session):
    return db.query(CategoryModel).all()

def delete_category(db: Session, category_id: int):
    db_category = db.query(CategoryModel).filter(CategoryModel.id == category_id).first()
    if not db_category:
        return None
    db.delete(db_category)
    db.commit()
    return db_category

def get_expenses(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    payment_method: Optional[PaymentMethod] = None,
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
):
    query = db.query(ExpenseModel)

    if category_id:
        query = query.filter(ExpenseModel.category_id == category_id)
    if type:
        query = query.filter(ExpenseModel.type == type)
    if payment_method:
        query = query.filter(ExpenseModel.payment_method == payment_method)
    if start_date and end_date:
        query = query.filter(ExpenseModel.date.between(start_date, end_date))

    total = query.count()
    items = query.offset(skip).limit(limit).all()
    return total, items

def update_expense(db: Session, expense_id: int, expense: ExpenseUpdate):
    db_expense = get_expense(db, expense_id)
    if not db_expense:
        return None
    for key, value in expense.model_dump(exclude_unset=True).items():
        setattr(db_expense, key, value)
    db.commit()
    db.refresh(db_expense)
    return db_expense


def delete_expense(db: Session, expense_id: int):
    db_expense = get_expense(db, expense_id)
    if not db_expense:
        return None
    db.delete(db_expense)
    db.commit()
    return db_expense


def get_summary(
    db: Session,
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
):
    query = db.query(ExpenseModel)
    if start_date and end_date:
        query = query.filter(ExpenseModel.date.between(start_date, end_date))

    # Overall totals by type
    totals = (
        query.with_entities(ExpenseModel.type, func.sum(ExpenseModel.amount))
        .group_by(ExpenseModel.type)
        .all()
    )
    totals_map = {t.value: 0.0 for t in TransactionType}
    for type_, total in totals:
        totals_map[type_.value] = float(total)

    total_expense = totals_map.get("expense", 0.0)
    total_saving = totals_map.get("saving", 0.0)

    # Breakdown by category
    by_category_raw = (
        query.join(CategoryModel, ExpenseModel.category_id == CategoryModel.id)
        .with_entities(
            CategoryModel.id,
            CategoryModel.name,
            ExpenseModel.type,
            func.sum(ExpenseModel.amount),
        )
        .group_by(CategoryModel.id, CategoryModel.name, ExpenseModel.type)
        .all()
    )

    by_category = [
        {
            "category_id": cat_id,
            "category_name": name,
            "type": type_,
            "total": float(total),
        }
        for cat_id, name, type_, total in by_category_raw
    ]

    return {
        "total_expense": total_expense,
        "total_saving": total_saving,
        "net": total_saving - total_expense,
        "by_category": by_category,
    }

def get_expenses_for_export(
    db: Session,
    start_date: Optional[datetime.date] = None,
    end_date: Optional[datetime.date] = None,
    category_id: Optional[int] = None,
    type: Optional[TransactionType] = None,
    payment_method: Optional[PaymentMethod] = None,
):
    query = db.query(ExpenseModel).join(CategoryModel, ExpenseModel.category_id == CategoryModel.id)
    if start_date and end_date:
        query = query.filter(ExpenseModel.date.between(start_date, end_date))
    if category_id:
        query = query.filter(ExpenseModel.category_id == category_id)
    if type:
        query = query.filter(ExpenseModel.type == type)
    if payment_method:
        query = query.filter(ExpenseModel.payment_method == payment_method)
    return query.order_by(ExpenseModel.date).all()

_PAYMENT_METHOD_LOOKUP = {
    member.value.strip().lower(): member for member in PaymentMethod
}

def _resolve_payment_method(raw: str) -> PaymentMethod:
    key = str(raw).strip().lower()
    if key not in _PAYMENT_METHOD_LOOKUP:
        valid = ", ".join(m.value for m in PaymentMethod)
        raise ValueError(f"'{raw}' is not a valid Payment Method. Valid options: {valid}")
    return _PAYMENT_METHOD_LOOKUP[key]