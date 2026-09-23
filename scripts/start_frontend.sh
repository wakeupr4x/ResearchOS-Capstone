#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR/frontend"

export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"

echo "=== Starting ResearchOS Next.js Frontend ==="
npm run dev
