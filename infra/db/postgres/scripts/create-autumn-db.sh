#!/usr/bin/env bash
# Create the `autumn` database on the local loftlancer Postgres container (idempotent).
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
POSTGRES_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
REPO_ROOT="$(cd "$POSTGRES_DIR/../../.." && pwd)"

# shellcheck source=../../../scripts/infra/lib.sh
source "$REPO_ROOT/scripts/infra/lib.sh"
loftlancer_load_runtime

cd "$POSTGRES_DIR"

exists="$("${COMPOSE[@]}" exec -T postgres psql -U postgres -tAc \
  "SELECT 1 FROM pg_database WHERE datname = 'autumn'")"

if [[ "${exists// /}" == "1" ]]; then
  echo "Database 'autumn' already exists."
  exit 0
fi

"${COMPOSE[@]}" exec -T postgres psql -U postgres -c "CREATE DATABASE autumn;"
echo "Created database 'autumn'."