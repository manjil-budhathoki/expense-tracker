"""initial schema

Revision ID: 8856df9f7c75
Revises: 
Create Date: 2026-09-08 10:49:33.962067

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8856df9f7c75'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "categories",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String, unique=True, nullable=False),
    )

    op.create_table(
        "expenses",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("amount", sa.Float, nullable=False),
        sa.Column("category_id", sa.Integer, sa.ForeignKey("categories.id"), nullable=False),
        sa.Column("type", sa.Enum("expense", "saving", name="transactiontype"), nullable=False, server_default="expense"),
        sa.Column("payment_method", sa.Enum("Cash", "Nabil bank", "NIMB Bank", "Card", "E-sewa", name="paymentmethod"), nullable=False, server_default="Cash"),
        sa.Column("note", sa.String, nullable=True),
        sa.Column("date", sa.Date, nullable=False),
    )

    op.create_table(
        "export_files",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String, unique=True, nullable=False),
        sa.Column("file_path", sa.String, nullable=False),
        sa.Column("format", sa.String, nullable=False),
        sa.Column("view", sa.String, nullable=False),
        sa.Column("created_at", sa.DateTime, server_default=sa.func.now()),
    )

    op.create_table(
        "import_files",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String, unique=True, nullable=False),
        sa.Column("file_path", sa.String, nullable=False),
        sa.Column("format", sa.String, nullable=False),
        sa.Column("rows_created", sa.Integer, server_default="0"),
        sa.Column("uploaded_at", sa.DateTime, server_default=sa.func.now()),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("import_files")
    op.drop_table("export_files")
    op.drop_table("expenses")
    op.drop_table("categories")
    op.execute("DROP TYPE IF EXISTS transactiontype")
    op.execute("DROP TYPE IF EXISTS paymentmethod")
