# Paisa · Expense Tracker

Personal finance tracker using React, Vite, Tailwind, FastAPI and SQLAlchemy. Works with PostgreSQL or SQLite.

## What is connected

- Expense and saving transactions: create, edit, delete, search, category creation, date and payment-method selection.
- Monthly salary and savings allocation, savings pots and deposits, long-term milestones, rent settings and payment history persist in the backend.
- Dashboard uses real records; new accounts start empty. Transaction savings and savings-pot balances are separate records, and rent history is not automatically added to expenses.
- Responsive navigation, mobile forms, visible loading/errors and confirmation before deleting transactions.
- Finance writes use a revision number to reject stale updates from another tab. Reload after a conflict.

This is a **single-user local application**. There is no authentication or per-user data isolation. Do not expose it as a public multi-user service.

## Local setup

Use Python 3.12+ and Node 22.12+.

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
# Optional: copy .env.example to .env for a new installation.
# Preserve an existing .env and its DATABASE_URL.
alembic upgrade head
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

Without DATABASE_URL, the backend uses `sqlite:///./expense_tracker.db`. For PostgreSQL set `DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE`. Run migrations before starting the API. The new migration adds finance storage and missing starter categories without replacing existing records.

In another terminal:

```bash
cd expense-tracker-frontend
npm install
npm run dev
```

Open http://localhost:5173. API docs: http://localhost:8000/docs.

The Vite development server forwards `/api` to the backend and removes the `/api` prefix. Set `VITE_API_TARGET` if the backend runs at another address. For a static production frontend, set `VITE_API_BASE_URL` to the backend URL before building, or configure your web server to forward `/api` and remove that prefix. Configure `CORS_ORIGINS` on the backend to allow the frontend origin. Static hosting must serve `index.html` for client-side routes.

## Docker development

For a new installation, copy root `.env.example` to `.env` and set `POSTGRES_PASSWORD`. For an existing PostgreSQL volume, use its existing password; changing an environment variable does not change the database password.

```bash
./deploy.sh
# or: docker compose up --build -d
```

The backend applies migrations before startup. `docker compose logs backend` shows startup status. This Compose configuration runs development servers, not a hardened production deployment.

## Checks

```bash
cd backend
python -m pytest tests -q
cd ../expense-tracker-frontend
npm run lint
npm run build
```

Tests use an isolated in-memory database. For migration verification, override DATABASE_URL to a temporary database before `alembic upgrade head`; back up real databases before upgrading them.

## API

- `GET /health`
- `GET/POST /v1/categories/`, `DELETE /v1/categories/{id}`
- `GET/POST /v1/expenses/`, `GET/PUT/DELETE /v1/expenses/{id}`
- `GET /v1/expenses/summary`
- `GET/PUT /v1/finance/`: `{revision, data}` containing salary, allocation, pots, milestones, rent settings/history
- Existing import/export endpoints remain available through `/docs`.

Expense lists support pagination (maximum 1,000 per page), category, type, payment method and independent start/end date filters. The UI loads all pages so totals are not truncated at 100 records. Finance persistence is a validated document suited to this single-user app; separate resource tables and incremental queries would be appropriate for larger datasets.
