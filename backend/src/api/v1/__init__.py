from fastapi import APIRouter
from src.api.v1.endpoints.api import router as expenses_router
from src.api.v1.endpoints.categories import router as categories_router

router = APIRouter()
router.include_router(expenses_router)
router.include_router(categories_router)