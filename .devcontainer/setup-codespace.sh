#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/SAT/backend"
FRONTEND_DIR="$REPO_ROOT/SAT/frontend"

echo "Preparing the SAT backend environment..."
python3 -m venv "$BACKEND_DIR/venv"
"$BACKEND_DIR/venv/bin/python" -m pip install --upgrade pip
"$BACKEND_DIR/venv/bin/python" -m pip install -r "$BACKEND_DIR/requirements.txt"

echo "Installing the SAT frontend dependencies..."
npm ci --prefix "$FRONTEND_DIR"

echo
echo "Codespace setup complete."
echo "Add the required Codespaces secrets, then run:"
echo "  bash .devcontainer/start-app.sh"
