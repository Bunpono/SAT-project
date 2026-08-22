#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKEND_DIR="$REPO_ROOT/SAT/backend"
FRONTEND_DIR="$REPO_ROOT/SAT/frontend"

REQUIRED_VARIABLES=(
  HF_TOKEN
  SUPABASE_URL
  SUPABASE_SECRET_KEY
  JWT_SECRET_KEY
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
)

MISSING_VARIABLES=()
for VARIABLE_NAME in "${REQUIRED_VARIABLES[@]}"; do
  if [[ -z "${!VARIABLE_NAME:-}" ]]; then
    MISSING_VARIABLES+=("$VARIABLE_NAME")
  fi
done

if (( ${#MISSING_VARIABLES[@]} > 0 )); then
  echo "The following GitHub Codespaces secrets are missing:"
  printf '  - %s\n' "${MISSING_VARIABLES[@]}"
  echo
  echo "Add them at GitHub Settings > Codespaces > Secrets, then restart this command."
  exit 1
fi

export HF_MODEL_ID="${HF_MODEL_ID:-SAT-Project/SAT-Model-T1}"
export HF_MODEL_CACHE_DIR="${HF_MODEL_CACHE_DIR:-$BACKEND_DIR/.cache/huggingface}"

BACKEND_LOG="/tmp/sat-backend.log"

cleanup() {
  if [[ -n "${BACKEND_PID:-}" ]] && kill -0 "$BACKEND_PID" 2>/dev/null; then
    kill "$BACKEND_PID"
  fi
}
trap cleanup EXIT INT TERM

echo "Starting FastAPI and loading $HF_MODEL_ID..."
cd "$BACKEND_DIR"
"$BACKEND_DIR/venv/bin/python" -m uvicorn main:app --host 127.0.0.1 --port 8000 \
  >"$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo "Waiting for the backend health check..."
for _ in {1..180}; do
  if curl --fail --silent http://127.0.0.1:8000/health >/dev/null; then
    break
  fi
  if ! kill -0 "$BACKEND_PID" 2>/dev/null; then
    echo "The backend stopped during startup:"
    cat "$BACKEND_LOG"
    exit 1
  fi
  sleep 1
done

if ! curl --fail --silent http://127.0.0.1:8000/health >/dev/null; then
  echo "The backend did not become healthy within three minutes:"
  cat "$BACKEND_LOG"
  exit 1
fi

echo "Backend ready. Starting the public Vite application on port 5173..."
echo "Backend logs: $BACKEND_LOG"
cd "$FRONTEND_DIR"
npm run dev -- --host 0.0.0.0
