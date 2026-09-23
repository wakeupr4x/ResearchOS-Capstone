#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=== Starting ResearchOS FastAPI Backend ==="
export PYTHONPATH="$DIR/backend"
"$DIR/backend/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 --reload
