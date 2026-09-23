#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"

echo "=========================================================="
echo "          Starting ResearchOS Full-Stack Platform         "
echo "=========================================================="

cleanup() {
    echo ""
    echo "Shutting down servers..."
    kill $(jobs -p) 2>/dev/null || true
    exit
}
trap cleanup SIGINT SIGTERM

# Start Backend
export PYTHONPATH="$DIR/backend"
echo "Starting Backend on http://localhost:8000..."
"$DIR/backend/.venv/bin/uvicorn" app.main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Wait for backend health
echo "Waiting for backend health check..."
sleep 3
curl -s http://localhost:8000/api/health || true
echo ""

# Start Frontend
echo "Starting Frontend on http://localhost:3000..."
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo " ResearchOS is running!"
echo " Frontend:  http://localhost:3000"
echo " Backend:   http://localhost:8000"
echo " API Docs:  http://localhost:8000/docs"
echo " Press Ctrl+C to terminate both servers"
echo "=========================================================="

wait $BACKEND_PID $FRONTEND_PID
