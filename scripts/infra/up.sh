#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"
loftlancer_load_runtime

echo "Using ${ENGINE} compose (${COMPOSE[*]})"
echo "Ports: see infra/ports.md (apps 3001–3004, infra 4001–4004)"

echo "→ Postgres (infra/db/postgres)"
loftlancer_compose "$REPO_ROOT/infra/db/postgres" up -d
loftlancer_wait_postgres

echo "→ Ensure autumn database exists"
bash "$REPO_ROOT/infra/db/postgres/scripts/create-autumn-db.sh"

echo "→ Redis (infra/redis)"
loftlancer_compose "$REPO_ROOT/infra/redis" up -d

echo "→ Autumn (infra/autumn)"
AUTUMN_DIR="$REPO_ROOT/infra/autumn"
AUTUMN_ARGS=(-f docker-compose.autumn.yml up -d)
if [[ "${LOFTLANCER_INFRA_BUILD:-0}" == 1 ]]; then
  AUTUMN_ARGS+=(--build)
fi
if [[ -f "$AUTUMN_DIR/.env" ]]; then
  AUTUMN_ARGS=(--env-file .env "${AUTUMN_ARGS[@]}")
fi
loftlancer_compose "$AUTUMN_DIR" "${AUTUMN_ARGS[@]}"

echo ""
echo "Infra is up. Run: pnpm infra-status"
echo "  Postgres :4003  Redis :4004  Autumn dashboard :4001  Autumn API :4002"
echo ""