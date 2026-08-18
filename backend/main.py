from fastapi import FastAPI
from src.core.database import engine, Base, SessionLocal
from src.models import model  # noqa: F401 — registers all models with Base
from src.models.model import CategoryModel
from src.api import router as api_router


Base.metadata.create_all(bind=engine)


def seed_categories():
    db = SessionLocal()
    if db.query(CategoryModel).count() == 0:
        defaults = ["Food", "Entertainment", "Utilities", "Transport", "Shopping", "Health", "Rent", "Salary", "Savings"]
        for name in defaults:
            db.add(CategoryModel(name=name))
        db.commit()
    db.close()


seed_categories()

app = FastAPI(title="Expense Tracker")
app.include_router(api_router)