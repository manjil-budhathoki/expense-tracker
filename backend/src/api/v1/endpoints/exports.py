import datetime
from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from typing import Literal

from src.core.database import get_db
from src.schemas.schema import PaymentMethod, TransactionType
from src.services import services, export_service

router = APIRouter(prefix="/export", tags=["export"])


def _get_rows(db, view, start_date, end_date, category_id, type, payment_method):
    if view == "summary":
        summary = services.get_summary(db, start_date, end_date)
        return export_service._rows_for_summary(summary), "Cash Flow Summary"
    else:
        expenses = services.get_expenses_for_export(db, start_date, end_date, category_id, type, payment_method)
        return export_service._rows_for_detail(expenses), "Transactions"


@router.post("/")
def export_file(
    name: str = Form(...),
    file_format: Literal["csv", "xlsx", "pdf"] = Form(...),
    view: Literal["detail", "summary"] = Form("detail"),
    start_date: datetime.date | None = Form(None),
    end_date: datetime.date | None = Form(None),
    category_id: int | None = Form(None),
    type: TransactionType | None = Form(None),
    payment_method: PaymentMethod | None = Form(None),
    db: Session = Depends(get_db),
):
    (header, rows), title = _get_rows(db, view, start_date, end_date, category_id, type, payment_method)

    try:
        record = export_service.create_export(db, name, file_format, view, header, rows, title)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    return {"message": f"Export '{name}' saved at {record.file_path}"}


@router.get("/")
def list_exports(db: Session = Depends(get_db)):
    from src.models.model import ExportFileModel
    return db.query(ExportFileModel).all()