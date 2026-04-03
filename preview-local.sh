#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-8000}"
URL="http://${HOST}:${PORT}/index.html"

OPEN_IN_BROWSER=0

if [[ "${1:-}" == "--open" ]]; then
  OPEN_IN_BROWSER=1
fi

cd "$ROOT_DIR"

echo "Local preview server"
echo "Root: $ROOT_DIR"
echo "URL : $URL"
echo
echo "Stop with: Ctrl+C"

if [[ "$OPEN_IN_BROWSER" -eq 1 ]] && command -v open >/dev/null 2>&1; then
  sleep 1 && open "$URL" >/dev/null 2>&1 &
fi

python3 -m http.server "$PORT" --bind "$HOST"
