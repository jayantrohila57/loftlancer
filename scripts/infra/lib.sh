#!/usr/bin/env bash
# Shared Podman/Docker Compose helpers for Loftlancer infra.
set -euo pipefail

loftlancer_repo_root() {
  local here
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  printf '%s' "$here"
}

loftlancer_load_runtime() {
  REPO_ROOT="$(loftlancer_repo_root)"
  RUNTIME_ENV="$REPO_ROOT/scripts/infra/runtime.env"
  if [[ -f "$RUNTIME_ENV" ]]; then
    # shellcheck disable=SC1090
    set -a
    source "$RUNTIME_ENV"
    set +a
  fi

  local runtime="${CONTAINER_RUNTIME:-podman}"
  case "$runtime" in
    podman)
      if ! command -v podman >/dev/null 2>&1; then
        echo "CONTAINER_RUNTIME=podman but podman is not installed." >&2
        exit 1
      fi
      if ! podman info >/dev/null 2>&1; then
        cat >&2 <<'EOF'
Podman is installed but the daemon/socket is not running.

  systemctl --user enable --now podman.socket
  export DOCKER_HOST=unix:///run/user/$(id -u)/podman/podman.sock   # if tools expect DOCKER_HOST

Or set CONTAINER_RUNTIME=docker in scripts/infra/runtime.env to use Docker.
EOF
        exit 1
      fi
      COMPOSE=(podman compose)
      ENGINE=podman
      ;;
    docker)
      if ! command -v docker >/dev/null 2>&1; then
        echo "CONTAINER_RUNTIME=docker but docker is not installed." >&2
        exit 1
      fi
      COMPOSE=(docker compose)
      ENGINE=docker
      ;;
    *)
      echo "Unknown CONTAINER_RUNTIME=$runtime (use podman or docker)." >&2
      exit 1
      ;;
  esac

  if ! "${COMPOSE[@]}" version >/dev/null 2>&1; then
    echo "Compose not available: ${COMPOSE[*]}" >&2
    exit 1
  fi
}

loftlancer_compose() {
  local dir="$1"
  shift
  (cd "$dir" && "${COMPOSE[@]}" "$@")
}

loftlancer_container_health() {
  local name="$1"
  "$ENGINE" inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{else}}{{.State.Status}}{{end}}' \
    "$name" 2>/dev/null || true
}

loftlancer_wait_postgres() {
  local attempts="${1:-60}"
  local i=0
  while [[ $i -lt $attempts ]]; do
    if [[ "$(loftlancer_container_health loftlancer-postgres)" == healthy ]]; then
      return 0
    fi
    sleep 2
    i=$((i + 1))
  done
  echo "Timed out waiting for loftlancer-postgres to become healthy." >&2
  return 1
}