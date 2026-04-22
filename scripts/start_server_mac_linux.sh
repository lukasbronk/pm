#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RUN_DIR="$ROOT_DIR/.run"
PID_FILE="$RUN_DIR/server.pid"
LOG_FILE="$RUN_DIR/server.log"
UV_BIN="${UV_BIN:-$HOME/.local/bin/uv}"
UV_CACHE_DIR="$ROOT_DIR/.uv-cache"

mkdir -p "$RUN_DIR"
mkdir -p "$UV_CACHE_DIR"

if [[ -f "$PID_FILE" ]] && kill -0 "$(cat "$PID_FILE")" 2>/dev/null; then
  echo "Server already running with PID $(cat "$PID_FILE")."
  exit 0
fi

cd "$ROOT_DIR"

if [[ -f "$ROOT_DIR/frontend/package.json" ]]; then
  npm --prefix "$ROOT_DIR/frontend" install
  npm --prefix "$ROOT_DIR/frontend" run build
fi

"$UV_BIN" sync --cache-dir "$UV_CACHE_DIR"
nohup "$UV_BIN" run --cache-dir "$UV_CACHE_DIR" uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 >"$LOG_FILE" 2>&1 &
echo $! >"$PID_FILE"

echo "Server started on http://127.0.0.1:8000"
echo "PID: $(cat "$PID_FILE")"
echo "Log: $LOG_FILE"
