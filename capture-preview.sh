#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="127.0.0.1"
PORT="${PORT:-4173}"
OUT_FILE="${1:-$ROOT_DIR/assets/previews/homepage-preview.png}"
LOG_FILE="${ROOT_DIR}/.preview-server.log"
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

if [[ ! -x "$CHROME_BIN" ]]; then
  echo "Chrome not found at: $CHROME_BIN" >&2
  exit 1
fi

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]]; then
    kill "$SERVER_PID" >/dev/null 2>&1 || true
  fi
}

trap cleanup EXIT

mkdir -p "$(dirname "$OUT_FILE")"

cd "$ROOT_DIR"
python3 -m http.server "$PORT" --bind "$HOST" >"$LOG_FILE" 2>&1 &
SERVER_PID=$!

sleep 1

"$CHROME_BIN" \
  --headless=new \
  --disable-gpu \
  --hide-scrollbars \
  --run-all-compositor-stages-before-draw \
  --virtual-time-budget=5000 \
  --window-size=1600,2200 \
  --screenshot="$OUT_FILE" \
  "http://${HOST}:${PORT}/index.html"

echo "Saved screenshot to $OUT_FILE"
