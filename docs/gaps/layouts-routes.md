# Gap: layouts and routes

**Purpose:** Tier 1 shell and Tier 2 section layouts must not be reimplemented inside `apps/*/src/components/layout`.

See: [layouts.md](../layouts.md).

---

## Tier 1 (Studio)

| Item | Rule |
|------|------|
| Owner | **`module/studio-shell/`** |
| Exports | `StudioShellLayout`, sidebar, header, inset — names fixed in module when scaffolded |
| App layout | Imports **`@module/studio-shell/...`** only — no duplicate shell JSX |

---

## Tier 2 (per feature section)

| Item | Rule |
|------|------|
| Owner | `module/<feature>/client/studio/layout/` |
| File | **`client.section.layout.tsx`** — shared by all child routes in that section |
| Optional | `client.section.tabs.tsx` — tab config consumed by section layout |

Sub-header (title, description, tabs, section actions) stays **stable** across sibling routes ([app-states.md](../app-states.md)).

---

## Route config (single source)

Each feature exports **`module/<feature>/client/config/client.routes.ts`**:

| Export | Purpose |
|--------|---------|
| `basePath` | Section URL prefix |
| `tabs` | `{ label, href }[]` for Tier 2 |
| `sidebarSegment` | Tier 1 nav highlight key |

**Forbidden:** hard-coded path strings scattered in components — import from **`client.routes.ts`**.

Tab labels/paths are **server-friendly config**; active tab from **pathname** (client may only highlight).

---

## Auth app (account)

| Decision | Rule |
|----------|------|
| Module name | **`module/account/`** for settings, sessions, consent UI |
| Tier 1 | **`module/account/client/auth/layout/`** or dedicated **`module/auth-shell/`** — pick **account** module for product settings; auth-shell only if split later |
| Scaffold | Add `account` to [module/README.md](../../module/README.md) domain table |

Do not reuse Studio **`studio-shell`** for Auth product pages.

---

## Cross-module navigation

Links between modules use **`client.routes.ts`** or shared helpers in **`module/shared/utils`** — not imports of another module’s feature components.

---

## Related

- [reference-module-teams.md](../reference-module-teams.md) — example Tier 2 tree  
- [client-layer.md](./client-layer.md) — skeletons in section layout  
