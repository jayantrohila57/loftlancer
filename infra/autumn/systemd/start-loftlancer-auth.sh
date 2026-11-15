#!/usr/bin/env bash
set -euo pipefail

WORKSPACE="$(cd "$(dirname "$0")/../../.." && pwd)"
# shellcheck source=../../../scripts/infra/lib.sh
source "$WORKSPACE/scripts/infra/lib.sh"
loftlancer_load_runtime

# Wait for the existing shared database and for any manually started auth app
# to release the port. This prevents duplicate Next.js servers in the checkout.
until [ "$(loftlancer_container_health loftlancer-postgres)" = healthy ]; do
  sleep 5
done
while [ -n "$(ss -H -ltn 'sport = :3002')" ]; do
  sleep 5
done
exec "${LOFTLANCER_PNPM:?LOFTLANCER_PNPM must identify the pnpm executable}" --filter auth dev
