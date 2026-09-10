"""Persist finance settings, savings goals and rent history."""
from alembic import op
import sqlalchemy as sa
revision = "20260910_finance"
down_revision = "8856df9f7c75"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("finance_state", sa.Column("id", sa.Integer(), primary_key=True),
                    sa.Column("revision", sa.Integer(), nullable=False),
                    sa.Column("data", sa.JSON(), nullable=False))
    categories = sa.table("categories", sa.column("name", sa.String()))
    connection = op.get_bind()
    existing = set(connection.execute(sa.select(categories.c.name)).scalars())
    for name in ["Food & Groceries", "Transport", "Housing", "Health", "Shopping", "Entertainment", "Education", "Other"]:
        if name not in existing:
            connection.execute(categories.insert().values(name=name))

def downgrade():
    op.drop_table("finance_state")
