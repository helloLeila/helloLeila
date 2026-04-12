#!/usr/bin/env bash
# GitHub 连通性检查脚本，用于排查仓库、DNS、HTTP 和 Git 拉取问题。

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HOST="github.com"
TARGET_URL="https://github.com"

GREEN="$(printf '\033[32m')"
YELLOW="$(printf '\033[33m')"
RED="$(printf '\033[31m')"
BLUE="$(printf '\033[34m')"
RESET="$(printf '\033[0m')"

# 输出分段标题，方便阅读诊断结果。
section() {
  printf "\n${BLUE}== %s ==${RESET}\n" "$1"
}

# 输出成功状态。
ok() {
  printf "${GREEN}[OK]${RESET} %s\n" "$1"
}

# 输出警告状态。
warn() {
  printf "${YELLOW}[WARN]${RESET} %s\n" "$1"
}

# 输出失败状态。
fail() {
  printf "${RED}[FAIL]${RESET} %s\n" "$1"
}

# 静默执行命令，并把标准输出和错误输出分别写入临时文件。
run_quiet() {
  "$@" >/tmp/check-github.out 2>/tmp/check-github.err
  return $?
}

# 如果文件存在，则只打印前几行关键信息。
print_file_if_exists() {
  local file="$1"
  if [[ -f "$file" ]]; then
    sed -n '1,12p' "$file"
  fi
}

section "Repo"
printf "Root   : %s\n" "$ROOT_DIR"
printf "Remote : "
git -C "$ROOT_DIR" remote get-url origin 2>/dev/null || echo "not configured"

section "Branch Status"
if run_quiet git -C "$ROOT_DIR" status -sb; then
  print_file_if_exists /tmp/check-github.out
else
  fail "Unable to read git status."
  print_file_if_exists /tmp/check-github.err
fi

section "DNS"
if command -v nslookup >/dev/null 2>&1; then
  if run_quiet nslookup "$HOST"; then
    ok "DNS can resolve $HOST"
    sed -n '1,8p' /tmp/check-github.out
  else
    fail "DNS failed to resolve $HOST"
    print_file_if_exists /tmp/check-github.err
  fi
else
  warn "`nslookup` is not installed."
fi

section "HTTP"
if command -v curl >/dev/null 2>&1; then
  if run_quiet curl -I --max-time 8 "$TARGET_URL"; then
    ok "HTTP request to GitHub succeeded"
    sed -n '1,5p' /tmp/check-github.out
  else
    fail "HTTP request to GitHub failed"
    print_file_if_exists /tmp/check-github.err
  fi
else
  warn "`curl` is not installed."
fi

section "Proxy"
env | grep -E '^(http_proxy|https_proxy|HTTP_PROXY|HTTPS_PROXY|ALL_PROXY|all_proxy|NO_PROXY|no_proxy)=' || warn "No proxy environment variables found."

section "Git Proxy"
if run_quiet git -C "$ROOT_DIR" config --get-regexp 'http.*proxy|https.*proxy'; then
  ok "Git proxy config found"
  cat /tmp/check-github.out
else
  warn "No git-specific proxy config found."
fi

section "Fetch Test"
if run_quiet git -C "$ROOT_DIR" fetch --dry-run origin; then
  ok "git fetch --dry-run succeeded"
  print_file_if_exists /tmp/check-github.out
else
  fail "git fetch --dry-run failed"
  print_file_if_exists /tmp/check-github.err
fi

section "Next Step"
cat <<'EOF'
If DNS or HTTP failed:
  1. reopen the terminal
  2. check VPN / proxy
  3. retry later on a stable network

If only fetch failed:
  1. check GitHub auth
  2. run: git pull --ff-only

If everything passed:
  run:
    git pull --ff-only
EOF
