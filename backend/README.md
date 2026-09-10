# FastAPI backend

See the root README for setup and configuration. Run `pip install -r requirements.txt`, then `alembic upgrade head` before starting `uvicorn main:app --reload`.

The API runs under `/v1`; Vite supplies the `/api` proxy prefix. SQLite is the default for local development; DATABASE_URL can select PostgreSQL. New finance settings use optimistic concurrency, and invalid category references, rent totals, savings balances and date filters return validation errors.

Run `python -m pytest tests -q` for the isolated API tests.
