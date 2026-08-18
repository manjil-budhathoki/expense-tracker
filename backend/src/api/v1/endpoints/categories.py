from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from src.core.database import get_db
from src.schemas.schema import Category, CategoryCreate
from src.services import services

router = APIRouter(prefix="/categories", tags=["categories"])


@router.post("/", response_model=Category)
def create_category(category: CategoryCreate, db: Session = Depends(get_db)):
    try:
        return services.create_category(db, category)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Category already exists")


@router.get("/", response_model=list[Category])
def list_categories(db: Session = Depends(get_db)):
    return services.get_categories(db)


@router.delete("/{category_id}")
def delete_category(category_id: int, db: Session = Depends(get_db)):
    result = services.delete_category(db, category_id)
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    return {"detail": "Deleted successfully"}