from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.services import services, export_service

router = APIRouter(prefix="/export", tags=["export"])


@router.get("/csv")
def export_csv(db: Session = Depends(get_db)):
    expenses = services.get_all_expenses_for_export(db)
    header, rows = export_service._rows_for_table(expenses)
    buffer = export_service.export_csv(header, rows)
    return StreamingResponse(
        buffer,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=expenses.csv"},
    )


@router.get("/xlsx")
def export_xlsx(db: Session = Depends(get_db)):
    expenses = services.get_all_expenses_for_export(db)
    header, rows = export_service._rows_for_table(expenses)
    buffer = export_service.export_xlsx(header, rows)
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=expenses.xlsx"},
    )


@router.get("/pdf")
def export_pdf(db: Session = Depends(get_db)):
    expenses = services.get_all_expenses_for_export(db)
    header, rows = export_service._rows_for_table(expenses)
    buffer = export_service.export_pdf("Expenses", header, rows)
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=expenses.pdf"},
    )