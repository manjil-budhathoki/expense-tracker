from sqlalchemy.orm import Session
from src.models.model import ExpenseModel, CategoryModel
from src.schemas.schema import ExpenseCreate, ExpenseUpdate, Optional,CategoryCreate


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

def get_expenses(db: Session, skip=0, limit=100, category_id: Optional[int] = None, type=None):
    query = db.query(ExpenseModel)
    if category_id:
        query = query.filter(ExpenseModel.category_id == category_id)
    if type:
        query = query.filter(ExpenseModel.type == type)
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