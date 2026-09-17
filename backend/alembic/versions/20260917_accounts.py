"""Add accounts, sessions, and transaction attribution."""
from alembic import op
import sqlalchemy as sa

revision = "20260917_accounts"
down_revision = "20260910_finance"
branch_labels = None
depends_on = None

def upgrade():
    op.create_table("users",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("email", sa.String(255), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(255), nullable=False))
    op.create_table("sessions",
        sa.Column("token_hash", sa.String(64), primary_key=True),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("expires_at", sa.DateTime(), nullable=False))
    with op.batch_alter_table("expenses") as batch:
        batch.add_column(sa.Column("created_by_id", sa.Integer(), sa.ForeignKey("users.id", name="fk_expenses_created_by_user"), nullable=True))

def downgrade():
    with op.batch_alter_table("expenses") as batch:
        batch.drop_column("created_by_id")
    op.drop_table("sessions")
    op.drop_table("users")
