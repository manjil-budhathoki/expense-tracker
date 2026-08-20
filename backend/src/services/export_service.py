import csv
import io

from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter

from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from datetime import datetime

# Single source of truth for the brand color used across xlsx + pdf.
BRAND_COLOR = "4338CA"  # no leading '#' — openpyxl wants it bare, reportlab adds it back
BRAND_COLOR_HEX = f"#{BRAND_COLOR}"


def _rows_for_table(expenses):
    header = ["Date", "Category", "Type", "Payment Method", "Amount", "Note"]
    rows = [
        [e.date.isoformat(), e.category.name, e.type.value, e.payment_method.value, e.amount, e.note or ""]
        for e in expenses
    ]
    return header, rows


def _amount_column_index(header) -> int | None:
    return next((i for i, h in enumerate(header) if str(h).strip().lower() == "amount"), None)


# --------------------------------------------------------------------------
# CSV
# --------------------------------------------------------------------------

def export_csv(header, rows) -> io.StringIO:
    buffer = io.StringIO()
    writer = csv.writer(buffer, quoting=csv.QUOTE_MINIMAL)
    writer.writerow(header)

    amount_idx = _amount_column_index(header)
    for row in rows:
        row = list(row)
        if amount_idx is not None and row[amount_idx] not in ("", None):
            row[amount_idx] = f"{float(row[amount_idx]):.2f}"
        writer.writerow(row)

    if amount_idx is not None and rows:
        total = sum(float(r[amount_idx]) for r in rows if r[amount_idx] not in ("", None))
        total_row = ["" for _ in header]
        total_row[max(amount_idx - 1, 0)] = "Total"
        total_row[amount_idx] = f"{total:.2f}"
        writer.writerow(total_row)

    buffer.seek(0)
    return buffer


# --------------------------------------------------------------------------
# XLSX
# --------------------------------------------------------------------------

def export_xlsx(header, rows) -> io.BytesIO:
    wb = Workbook()
    ws = wb.active
    ws.title = "Expenses"

    header_fill = PatternFill(start_color=BRAND_COLOR, end_color=BRAND_COLOR, fill_type="solid")
    header_font = Font(color="FFFFFF", bold=True)
    thin_border = Border(
        left=Side(style="thin", color="E5E7EB"),
        right=Side(style="thin", color="E5E7EB"),
        top=Side(style="thin", color="E5E7EB"),
        bottom=Side(style="thin", color="E5E7EB"),
    )
    alt_fill = PatternFill(start_color="F3F4F6", end_color="F3F4F6", fill_type="solid")

    ws.append(header)
    for col in range(1, len(header) + 1):
        cell = ws.cell(row=1, column=col)
        cell.fill = header_fill
        cell.font = header_font
        cell.alignment = Alignment(horizontal="left", vertical="center")
        cell.border = thin_border

    amount_idx = _amount_column_index(header)

    for r, row in enumerate(rows, start=2):
        ws.append(row)
        for c in range(1, len(header) + 1):
            cell = ws.cell(row=r, column=c)
            cell.border = thin_border
            if r % 2 == 0:
                cell.fill = alt_fill
            if amount_idx is not None and c - 1 == amount_idx:
                cell.number_format = "#,##0.00"

    if amount_idx is not None and rows:
        total_row_idx = len(rows) + 2
        ws.cell(row=total_row_idx, column=max(amount_idx, 1)).value = "Total"
        total_cell = ws.cell(row=total_row_idx, column=amount_idx + 1)
        total_cell.value = f"=SUM({get_column_letter(amount_idx + 1)}2:{get_column_letter(amount_idx + 1)}{total_row_idx - 1})"
        total_cell.number_format = "#,##0.00"
        for c in range(1, len(header) + 1):
            cell = ws.cell(row=total_row_idx, column=c)
            cell.font = Font(bold=True)
            cell.border = Border(top=Side(style="thin", color=BRAND_COLOR))

    # auto column width based on longest value per column
    for c in range(1, len(header) + 1):
        col_letter = get_column_letter(c)
        max_len = max(
            [len(str(header[c - 1]))] + [len(str(row[c - 1])) for row in rows]
        )
        ws.column_dimensions[col_letter].width = min(max(max_len + 4, 10), 40)

    ws.freeze_panes = "A2"

    buffer = io.BytesIO()
    wb.save(buffer)
    buffer.seek(0)
    return buffer


# --------------------------------------------------------------------------
# PDF
# --------------------------------------------------------------------------

def export_pdf(title, header, rows) -> io.BytesIO:
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch,
        leftMargin=0.5 * inch,
        rightMargin=0.5 * inch,
    )
    styles = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ExportTitle",
        parent=styles["Heading1"],
        textColor=colors.HexColor(BRAND_COLOR_HEX),
        spaceAfter=2,
    )
    subtitle_style = ParagraphStyle(
        "ExportSubtitle",
        parent=styles["Normal"],
        fontSize=9,
        textColor=colors.HexColor("#6B7280"),
        spaceAfter=16,
    )

    elements = [Paragraph(title, title_style)]
    generated = datetime.now().strftime("%B %d, %Y \u2022 %I:%M %p")
    elements.append(Paragraph(f"Generated {generated} &bull; {len(rows)} records", subtitle_style))

    table_data = [header] + [[str(cell) for cell in row] for row in rows]

    amount_idx = _amount_column_index(header)
    if amount_idx is not None and rows:
        total = sum(float(r[amount_idx]) for r in rows if r[amount_idx] not in ("", None))
        total_row = ["" for _ in header]
        total_row[max(amount_idx - 1, 0)] = "Total"
        total_row[amount_idx] = f"{total:,.2f}"
        table_data.append(total_row)

    table = Table(table_data, repeatRows=1, hAlign="LEFT")

    style_commands = [
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor(BRAND_COLOR_HEX)),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTSIZE", (0, 0), (-1, -1), 9),
        ("TOPPADDING", (0, 0), (-1, -1), 6),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
        ("LEFTPADDING", (0, 0), (-1, -1), 8),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.HexColor("#E5E7EB")),
        ("ROWBACKGROUNDS", (0, 1), (-1, len(table_data) - 1), [colors.white, colors.HexColor("#F3F4F6")]),
    ]

    if amount_idx is not None and rows:
        last = len(table_data) - 1
        style_commands += [
            ("BACKGROUND", (0, last), (-1, last), colors.HexColor("#E5E7EB")),
            ("FONTNAME", (0, last), (-1, last), "Helvetica-Bold"),
            ("LINEABOVE", (0, last), (-1, last), 1, colors.HexColor(BRAND_COLOR_HEX)),
        ]

    table.setStyle(TableStyle(style_commands))
    elements.append(table)

    doc.build(elements, onFirstPage=_draw_footer, onLaterPages=_draw_footer)
    buffer.seek(0)
    return buffer


def _draw_footer(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#9CA3AF"))
    canvas.drawString(0.5 * inch, 0.4 * inch, "Expense Tracker")
    canvas.drawRightString(letter[0] - 0.5 * inch, 0.4 * inch, f"Page {doc.page}")
    canvas.restoreState()