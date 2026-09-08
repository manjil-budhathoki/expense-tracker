# Expense Tracker

Full-stack expense tracker with FastAPI backend, React frontend, and PostgreSQL.

## Quick Start with Docker

```bash
# Start everything
./deploy.sh

# Stop everything
docker compose down
```

Services:
- Frontend: http://localhost:5173
- Backend: http://localhost:8000
- Database: localhost:5432

## Manual Setup (without Docker)

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # edit with your DATABASE_URL
alembic upgrade head
uvicorn main:app --reload
```

### Frontend
```bash
cd expense-tracker-frontend
npm install
npm run dev
```
