#!/usr/bin/env bash
# 本地预览脚本，用于用固定地址启动 React 开发服务。

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4173}"
URL="http://${HOST}:${PORT}/"

OPEN_IN_BROWSER=0

if [[ "${1:-}" == "--open" ]]; then
  OPEN_IN_BROWSER=1
fi

cd "$ROOT_DIR"

echo "Local React preview server"
echo "Root: $ROOT_DIR"
echo "URL : $URL"
echo
echo "Stop with: Ctrl+C"

# 按需自动打开浏览器，便于快速查看本地预览结果。
if [[ "$OPEN_IN_BROWSER" -eq 1 ]] && command -v open >/dev/null 2>&1; then
  sleep 1 && open "$URL" >/dev/null 2>&1 &
fi

npm run dev -- --host "$HOST" --port "$PORT"
