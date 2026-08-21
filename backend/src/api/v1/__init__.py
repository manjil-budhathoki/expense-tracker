from fastapi import APIRouter
from src.api.v1.endpoints.api import router as expenses_router
from src.api.v1.endpoints.categories import router as categories_router
from src.api.v1.endpoints.exports import router as export_router
from src.api.v1.endpoints.imports import router as import_router
from src.api.v1.endpoints.auth import router as auth_router
router = APIRouter()
router.include_router(expenses_router)
router.include_router(categories_router)
router.include_router(export_router)
router.include_router(import_router)
router.include_router(import_router)