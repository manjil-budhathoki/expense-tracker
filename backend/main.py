from contextlib import asynccontextmanager
from fastapi import FastAPI

from src.core.database import engine, Base
from src.models import model  # noqa: F401 — registers ExpenseModel with Base
from src.api.v1.endpoints.api import router as expenses_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Expense Tracker", lifespan=lifespan)
app.include_router(expenses_router)