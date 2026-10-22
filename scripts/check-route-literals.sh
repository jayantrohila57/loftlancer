#!/usr/bin/env bash
# CI gate (#300): studio links go through the route builder
# (apps/studio/src/utils/navigation.ts → @loftlancer/ui/studio-routes).
# Fails on hard-coded legacy paths: "/dashboard…" and "/p/…".
set -euo pipefail
cd "$(dirname "$0")/.."

pattern='(["'"'"'`]|/studio)/dashboard([/"'"'"'`?#]|$)|["'"'"'`]/p/'
paths=(apps/studio/src apps/auth/src apps/docs/src apps/www/src packages)

if matches=$(grep -RInE "$pattern" "${paths[@]}" \
  --include='*.ts' --include='*.tsx' --include='*.mts' --include='*.mjs' \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=out \
  --exclude-dir=dist); then
  echo "Legacy route literals found. Use \`routes.*\` from utils/navigation:" >&2
  echo "$matches" >&2
  exit 1
fi
echo "route literals: ok"
