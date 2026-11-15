#!/usr/bin/env bash
set -euo pipefail

# shellcheck source=lib.sh
source "$(dirname "$0")/lib.sh"
loftlancer_load_runtime

echo "Runtime: ${ENGINE} (${COMPOSE[*]})"
echo ""
echo "=== Containers (loftlancer-*, fk-autumn-*) ==="
if [[ "$ENGINE" == podman ]]; then
  podman ps -a --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>/dev/null \
    | awk 'NR == 1 || /loftlancer|fk-autumn/'
else
  docker ps -a --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' 2>/dev/null \
    | awk 'NR == 1 || /loftlancer|fk-autumn/'
fi

echo ""
echo "=== Host ports (infra 4001–4004) ==="
for port in 4001 4002 4003 4004; do
  if ss -tln "( sport = :$port )" 2>/dev/null | grep -q LISTEN; then
    echo "  :$port listening"
  else
    echo "  :$port free"
  fi
done
