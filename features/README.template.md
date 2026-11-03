# `<name>` feature

One-line purpose. Link parent GitHub issue: `#NNN`.

**Layer rules:** [features/README.md](../README.md) · [docs/naming.md](../docs/naming.md)

---

## Agent workflow (this feature)

1. Implement **one sub-issue** at a time; branch `feat/<parent>-<slug>` from **`dev`**.
2. **Do not** import `@modules/*` or `@module/*` from this feature — lift shared types to `features/<name>/src/shared` or `packages/`.
3. Modules consume this feature via **`@features/<name>/...`**.
4. Record blocked work under **TODO (blocked)** below.

---

## Directory map

```
features/<name>/src/
  shared/   # types, validation, hooks shared across server/client
  server/   # controllers/services when feature exposes server behavior
  client/   # UI boundaries, hooks, skeletons
```

---

## Verification

```bash
pnpm check-types
pnpm audit:module-architecture
```

---

## TODO (blocked)

| Item | Blocked on | Issue | Notes |
| ---- | ---------- | ----- | ----- |
|      |            |       |       |

---

## Changelog

User-facing changes go in root [CHANGELOG.md](../CHANGELOG.md) `[Unreleased]` when merged to **`dev`**.
