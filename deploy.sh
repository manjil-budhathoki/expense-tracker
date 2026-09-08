#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE_FILE="$SCRIPT_DIR/docker-compose.yml"

echo "Building and starting expense tracker..."
docker compose -f "$COMPOSE_FILE" up --build -d

echo "Waiting for database to be ready..."
sleep 5

echo "Running database migrations..."
docker compose -f "$COMPOSE_FILE" exec -T backend alembic upgrade head

echo "Seeding default categories..."
docker compose -f "$COMPOSE_FILE" exec -T backend python -c "
from src.core.database import SessionLocal
from src.models.model import CategoryModel

db = SessionLocal()
if db.query(CategoryModel).count() == 0:
    defaults = ['Food', 'Entertainment', 'Utilities', 'Transport', 'Shopping', 'Health', 'Rent', 'Salary', 'Savings']
    for name in defaults:
        db.add(CategoryModel(name=name))
    db.commit()
    print(f'Seeded {len(defaults)} categories')
else:
    print('Categories already exist')
db.close()
"

echo ""
echo "Services running:"
echo "  Frontend:  http://localhost:5173"
echo "  Backend:   http://localhost:8000"
echo "  Database:  localhost:5432"
echo ""
echo "To stop: docker compose -f $COMPOSE_FILE down"
