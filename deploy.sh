#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"
docker compose up --build -d
echo "Starting Paisa. Backend migrations run automatically before the API starts."
echo "Frontend: http://localhost:5173"
echo "API docs: http://localhost:8000/docs"
echo "Check readiness: docker compose logs backend"
