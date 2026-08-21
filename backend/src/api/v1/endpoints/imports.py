from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Literal

from src.core.database import get_db
from src.services import import_service

router = APIRouter(prefix="/import", tags=["import"])

@router.post("/")
def import_file(
    name: str = Form(...),
    file_format: Literal["csv", "xlsx"] = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    try:
        record, created, errors = import_service.create_import(db, name, file, file_format)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {
        "message": f"Import '{name}' saved at {record.file_path}",
        "created": created,
        "errors": errors,
    }

@router.get("/")
def list_imports(db: Session = Depends(get_db)):
    from src.models.model import ImportFileModel
    return db.query(ImportFileModel).all()