# Gap: priority implementation order

**Purpose:** Build shared contracts before feature modules so agents do not freestyle per-feature shapes.

---

## Priority (stop most improvisation)

| # | Deliverable | Status target |
|---|-------------|---------------|
| 1 | **ServiceResponse** types + Zod + factories | `module/shared/utils/**` |
| 2 | **`runAction` + `emitActionEvent`** signatures (+ wire to `@loftlancer/api`) | `module/shared/server/**` |
| 3 | **`@module/*` paths** + include `module/**` in check-types | [tooling.md](../tooling.md), app tsconfigs |
| 4 | **oRPC procedure template** + `procedures/<domain>.ts` | [orpc-transport.md](./orpc-transport.md) |
| 5 | **Hook + boundary + toast** templates | [client-layer.md](./client-layer.md), shared client utils |
| 6 | **ServiceResponse vs loading/empty** — single story | [contracts.md](./contracts.md), [client-layer.md](./client-layer.md) |
| 7 | **`module/studio-shell` + `module/account` + route config** | [layouts-routes.md](./layouts-routes.md) |
| 8 | **Pilot `module/teams`** end-to-end | [reference-module-teams.md](../reference-module-teams.md) |

---

## After shared layer

- Per-domain scaffolds under `module/<feature>/`  
- Migrate procedures from legacy transport one domain at a time  
- CI guardrails ([forbidden-defaults.md](./forbidden-defaults.md))

---

## Count of prescriptive holes

The gap index in [architecture-gaps.md](../architecture-gaps.md) lists **~44** explicit rules across nine category files. Closing items **1–8** above addresses the highest-risk improvisation.

---

## Related

- [architecture-gaps.md](../architecture-gaps.md)  
