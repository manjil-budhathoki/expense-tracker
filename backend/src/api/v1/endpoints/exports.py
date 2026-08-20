from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from src.core.database import get_db
from src.services import services, export_service
from src.schemas.schema import ExportFormat

router = APIRouter(prefix="/export", tags=["export"])




_EXPORTERS = {
    ExportFormat.csv: (export_service.export_csv, "text/csv"),
    ExportFormat.xlsx: (
        export_service.export_xlsx,
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ),
    ExportFormat.pdf: (
        lambda header, rows: export_service.export_pdf("Expenses", header, rows),
        "application/pdf",
    ),
}


@router.get("")
def export_expenses(
    type: ExportFormat = Query(..., description="csv, xlsx, or pdf"),
    db: Session = Depends(get_db),
):
    expenses = services.get_all_expenses_for_export(db)
    header, rows = export_service._rows_for_table(expenses)

    exporter, media_type = _EXPORTERS[type]
    buffer = exporter(header, rows)

    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename=expenses.{type.value}"},
    )