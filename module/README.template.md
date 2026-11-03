# `<domain>` module

One-line purpose. Link parent GitHub issue: `#NNN`.

**Platform rules (read-only index):** [docs/modules.md](../docs/modules.md) · [docs/naming.md](../docs/naming.md) · [docs/new-feature-checklist.md](../docs/new-feature-checklist.md)

---

## Agent workflow (this module)

1. Implement **one sub-issue** at a time; branch `feat/<parent>-<slug>` from **`dev`**.
2. **Plan** in chat before coding if the sub-issue spans utils + server + transport + client.
3. **Reference** only `module/<domain>/`, `module/shared/`, and thin oRPC — not `apps/studio/src/module/*` or `packages/orpc/src/modules/*` as templates.
4. Record blocked work under **TODO (blocked)** below; do not ship cross-module hacks.

---

## Flow

`app route re-export → module RSC → server/page → controller → runAction → service`

`client hook → @/lib/orpc → packages/orpc/src/orpc/procedures/<domain>.ts → same controller`

---

## Migration boundaries

What is **in scope** for this module vs what stays legacy until a linked issue lands. List paths that are **read-only** (compat only), not copy templates.

---

## Directory map

Short tree or pointer to key files (optional if obvious from naming).

---

## Verification

Commands agents must run before marking a sub-issue done:

```bash
pnpm audit:module-architecture
pnpm audit:architecture-layers
pnpm check-types
# domain tests, e.g. pnpm test:<domain>
```

Before merging the **parent** issue branch to **`dev`**: **`pnpm verify:dev-merge`**.

---

## Sub-issues (parent `#NNN`)

| Sub-issue | Scope | Status |
| --------- | ----- | ------ |
| #         |       |        |

---

## TODO (blocked)

| Item | Blocked on | Issue | Notes |
| ---- | ---------- | ----- | ----- |
|      |            |       |       |

---

## Changelog

User-facing changes for this module go in root [CHANGELOG.md](../CHANGELOG.md) `[Unreleased]` when merged to **`dev`**.
