# Backend

FastAPI backend with SQLAlchemy and Alembic.

## Environment

Create `.env` with:
```
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

## Commands

```bash
# Run migrations
alembic upgrade head

# Create migration
alembic revision --autogenerate -m "description"

# Start server
uvicorn main:app --reload
```
