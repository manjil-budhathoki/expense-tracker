import os
import csv
import datetime
from openpyxl import Workbook
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.lib import colors
from sqlalchemy.orm import Session

from src.models.model import ExportFileModel

EXPORT_DIR = "exports"
os.makedirs(EXPORT_DIR, exist_ok=True)


def _rows_for_detail(expenses):
    header = ["Date", "Category", "Type", "Payment Method", "Amount", "Note"]
    rows = [
        [e.date.isoformat(), e.category.name, e.type.value, e.payment_method.value, e.amount, e.note or ""]
        for e in expenses
    ]
    return header, rows


def _rows_for_summary(summary: dict):
    header = ["Category", "Type", "Total"]
    rows = [
        [c["category_name"], c["type"].value if hasattr(c["type"], "value") else c["type"], c["total"]]
        for c in summary["by_category"]
    ]
    rows.append(["", "", ""])
    rows.append(["Total Expense", "", summary["total_expense"]])
    rows.append(["Total Saving", "", summary["total_saving"]])
    rows.append(["Net", "", summary["net"]])
    return header, rows


def _write_csv(path, header, rows):
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow(header)
        writer.writerows(rows)


def _write_xlsx(path, header, rows):
    wb = Workbook()
    ws = wb.active
    ws.append(header)
    for row in rows:
        ws.append(row)
    wb.save(path)


def _write_pdf(path, title, header, rows):
    doc = SimpleDocTemplate(path, pagesize=letter)
    styles = getSampleStyleSheet()
    elements = [Paragraph(title, styles["Heading1"])]
    table_data = [header] + [[str(cell) for cell in row] for row in rows]
    table = Table(table_data)
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#4338CA")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
    ]))
    elements.append(table)
    doc.build(elements)


def create_export(db: Session, name: str, file_format: str, view: str, header, rows, title="Report"):
    existing = db.query(ExportFileModel).filter(ExportFileModel.name == name).first()
    if existing:
        raise ValueError(f"An export named '{name}' already exists.")

    ext = file_format
    filename = f"{name}.{ext}"
    file_path = os.path.join(EXPORT_DIR, filename)

    if file_format == "csv":
        _write_csv(file_path, header, rows)
    elif file_format == "xlsx":
        _write_xlsx(file_path, header, rows)
    elif file_format == "pdf":
        _write_pdf(file_path, title, header, rows)
    else:
        raise ValueError("Unsupported format")

    record = ExportFileModel(name=name, file_path=file_path, format=file_format, view=view)
    db.add(record)
    db.commit()
    db.refresh(record)
    return record