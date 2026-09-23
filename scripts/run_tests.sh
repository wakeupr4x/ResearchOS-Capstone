#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

echo "=== Running ResearchOS Backend Pytest Suite ==="
export PYTHONPATH="$DIR/backend"
"$DIR/backend/.venv/bin/pytest" backend/tests/ -v

echo ""
echo "=== Running ResearchOS Grounding & Evaluation Suite ==="
"$DIR/backend/.venv/bin/python" evaluation/eval_rag.py

echo ""
echo "=== Checking Frontend Build Integrity ==="
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"
cd "$DIR/frontend"
npm run build

echo ""
echo "=== ALL RESEARCHOS VERIFICATION TESTS PASSED SUCCESSFULLY ==="
