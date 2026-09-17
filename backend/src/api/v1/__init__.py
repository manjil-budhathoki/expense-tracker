from fastapi import APIRouter, Depends
from src.api.v1.endpoints.api import router as expenses_router
from src.api.v1.endpoints.categories import router as categories_router
from src.api.v1.endpoints.exports import router as export_router
from src.api.v1.endpoints.imports import router as import_router

from src.api.v1.endpoints.finance import router as finance_router
from src.api.v1.endpoints.auth import router as auth_router, current_user

router = APIRouter()
router.include_router(auth_router)
protection = [Depends(current_user)]
router.include_router(finance_router, dependencies=protection)
router.include_router(expenses_router, dependencies=protection)
router.include_router(categories_router, dependencies=protection)
router.include_router(export_router, dependencies=protection)
router.include_router(import_router, dependencies=protection)
