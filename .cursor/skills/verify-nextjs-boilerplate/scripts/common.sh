#!/usr/bin/env bash
# Shared paths and instance helpers for verify-nextjs-boilerplate.
# Source from sibling scripts only.

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
SKILL_DIR=$(cd "${SCRIPT_DIR}/.." && pwd)

repo_root() {
  git -C "${SKILL_DIR}" rev-parse --show-toplevel
}

REPO_ROOT=$(repo_root)
VERIFY_PORT=${VERIFY_PORT:-3100}
VERIFY_HOST=${VERIFY_HOST:-127.0.0.1}
VERIFY_URL=${VERIFY_URL:-"http://${VERIFY_HOST}:${VERIFY_PORT}"}
RUN_DIR="${REPO_ROOT}/test-results/verify/.run"
INSTANCE_FILE="${RUN_DIR}/instance"
SERVER_LOG="${RUN_DIR}/server.log"
EVIDENCE_DIR="${REPO_ROOT}/test-results/verify/evidence"
SESSION_PREFIX=verify-nextjs-boilerplate

browser_session() {
  agent-browser session id --scope worktree --prefix "${SESSION_PREFIX}"
}

pid_alive() {
  local pid=$1
  [[ -n ${pid} ]] && kill -0 "${pid}" 2>/dev/null
}

pid_cwd() {
  local pid=$1
  lsof -a -p "${pid}" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1
}

port_listen_pids() {
  local port=$1
  lsof -nP -iTCP:"${port}" -sTCP:LISTEN -t 2>/dev/null | sort -u || true
}

is_ancestor_of() {
  local ancestor=$1
  local node=$2
  while [[ -n ${node} && ${node} != 0 && ${node} != 1 ]]; do
    if [[ ${node} == "${ancestor}" ]]; then
      return 0
    fi
    node=$(ps -o ppid= -p "${node}" 2>/dev/null | tr -d ' ')
  done
  return 1
}

checkout_server_pids() {
  local pid cwd
  local pids
  pids=$(pgrep -f "next-server|next dev" 2>/dev/null || true)
  for pid in ${pids}; do
    cwd=$(pid_cwd "${pid}" || true)
    if [[ ${cwd} == "${REPO_ROOT}" ]]; then
      printf '%s\n' "${pid}"
    fi
  done
}

load_instance() {
  if [[ ! -f ${INSTANCE_FILE} ]]; then
    echo "doctor: no instance file at ${INSTANCE_FILE}" >&2
    echo "doctor: launch this verification instance first (scripts/launch)." >&2
    return 1
  fi
  # shellcheck disable=SC1090
  source "${INSTANCE_FILE}"
}

write_instance() {
  local pid=$1
  mkdir -p "${RUN_DIR}"
  cat >"${INSTANCE_FILE}" <<EOF
VERIFY_PID=${pid}
VERIFY_PORT=${VERIFY_PORT}
VERIFY_HOST=${VERIFY_HOST}
VERIFY_URL=${VERIFY_URL}
VERIFY_CWD=${REPO_ROOT}
VERIFY_LOG=${SERVER_LOG}
VERIFY_STARTED_AT=$(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
}

kill_tree() {
  local pid=$1
  local child
  if ! pid_alive "${pid}"; then
    return 0
  fi
  for child in $(pgrep -P "${pid}" 2>/dev/null || true); do
    kill_tree "${child}"
  done
  kill "${pid}" 2>/dev/null || true
}

wait_for_ready_log() {
  local tries=${1:-60}
  local i
  for ((i = 1; i <= tries; i++)); do
    if [[ -n ${VERIFY_PID:-} ]] && ! pid_alive "${VERIFY_PID}"; then
      return 1
    fi
    if grep -E -q "Ready in|Local:" "${SERVER_LOG}" 2>/dev/null; then
      return 0
    fi
    sleep 0.5
  done
  return 1
}

wait_for_home() {
  local url=$1
  local tries=${2:-30}
  local body
  local i
  for ((i = 1; i <= tries; i++)); do
    if body=$(curl -sS --connect-timeout 2 --max-time 30 "${url}/" 2>/dev/null); then
      if printf '%s' "${body}" | grep -q '<h1>Next.js Boilerplate</h1>'; then
        return 0
      fi
    fi
    sleep 1
  done
  return 1
}
