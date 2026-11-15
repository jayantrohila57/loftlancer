#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"
loftlancer_load_runtime

echo "Using ${ENGINE} compose (${COMPOSE[*]})"

echo "→ Autumn"
AUTUMN_DIR="$REPO_ROOT/infra/autumn"
AUTUMN_ARGS=(-f docker-compose.autumn.yml down)
if [[ -f "$AUTUMN_DIR/.env" ]]; then
  AUTUMN_ARGS=(--env-file .env "${AUTUMN_ARGS[@]}")
fi
loftlancer_compose "$AUTUMN_DIR" "${AUTUMN_ARGS[@]}"

echo "→ Redis"
loftlancer_compose "$REPO_ROOT/infra/redis" down

echo "→ Postgres"
loftlancer_compose "$REPO_ROOT/infra/db/postgres" down

echo ""
echo "Infra is down (Loftlancer compose stacks only)."