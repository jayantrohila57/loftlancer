# Layouts & module routes

How **routes map to modules** and how **two layout tiers** (shell + section) stay consistent while allowing module-specific sidebar, header, and sub-header behavior.

**Cursor rule:** [.cursor/rules/layouts.mdc](../.cursor/rules/layouts.mdc) (applies when editing `app/**/layout.tsx`, module `layout/`, `studio-shell`).

**Current Studio layouts** under `apps/studio/src/components/layout` and scattered `app/**/layout.tsx` are **legacy** — new work follows this doc and lives in **`module/<feature>/client/…`**.

---

## Rules (summary)

1. **One module per route tree** — child pages under a prefix use that module’s Tier 2 layout.
2. **Tier 1** — single Studio shell (`module/studio-shell`): sidebar, inset, header; sidebar **content** from module config.
3. **Tier 2** — per module section: sub-header (+ optional tabs); **all siblings share one** `client.section.layout.tsx`.
4. **Pages** — content only; no second sub-header on leaf routes.
5. **Apps** — `layout.tsx` / `page.tsx` **import and render module exports only**.
6. **Same visual system** — spacing/inset from shared patterns; variation via slots/config, not one-off wrappers.
7. **Loading skeletons** — match Tier 2 geometry; don’t replace Tier 1 on segment load ([app-states.md](./app-states.md)).

Related: [modules.md](./modules.md), [rendering.md](./rendering.md), [app-states.md](./app-states.md), [server-api.md](./server-api.md).

---

## Module owns its route tree

| Rule                        | Detail                                                                                                                                              |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **URL segment ↔ module**    | Each product domain has a route prefix and **child pages under that prefix belong to that module** (e.g. `/studio/[org]/teams/…` → `module/teams`). |
| **Cross-module links only** | Navigation between modules uses shared route helpers; no feature UI imported across modules except via `module/shared` or `@loftlancer/ui`.         |
| **App `app/`**              | Filesystem routes only — each `layout.tsx` / `page.tsx` **imports** the matching **module layout** or **module page**; no layout logic in apps.     |

Example mapping (illustrative):

| Route area                                | Module          |
| ----------------------------------------- | --------------- |
| `/[org]/teams/…`                          | `teams`         |
| `/[org]/projects/…`, `/[org]/[project]/…` | `projects`      |
| `/[org]/members`, `/[org]/settings`, …    | `organizations` |
| `/support/…`                              | `support`       |

Add rows in [module/README.md](../module/README.md) as routes migrate.

---

## Two layout tiers

All authenticated product UI shares one **visual system** (spacing, inset, typography). Variation is **configuration and slots**, not one-off page wrappers.

```text
Tier 1 — Studio shell layout          (sidebar + inset + primary header)
    │
    └── Tier 2 — Module section layout   (sub-header: title, tabs, actions — optional per module)
            │
            └── Page content             (module server page → RSC → dynamic client islands)
```

### Tier 1 — Shell layout (`module/studio-shell/` or shared studio module)

**Includes:**

- Global **sidebar** (nav groups; **items can vary by active module/route** via config from current segment)
- **Inset** / main column
- **Primary header** (org context, global actions, breadcrumbs top level)

**Does not include:**

- Module-specific tab rows (unless global)
- Page body content

**One implementation** for Studio; sidebar **composition** reads **module route metadata** (which links, which badges, collapsed sections).

Target location (to be created on rewrite):

```text
module/studio-shell/client/studio/
├── layout/client.shell.layout.tsx      # Tier 1 wrapper
├── components/client.sidebar.tsx       # shell sidebar (slot/config driven)
├── components/client.header.tsx
└── config/client.nav-by-module.ts      # which sidebar blocks per module prefix
```

Apps:

```text
apps/studio/src/app/(private)/(shell)/layout.tsx
  → import { StudioShellLayout } from "@module/studio-shell/…"
  → {children}
```

### Tier 2 — Module section layout

**Per module** (or per major subsection): **sub-header** + stable chrome for **all child routes** in that section.

**Includes:**

- **Sub-header** — title, description, **tabs** (optional), section actions
- Optional second toolbar row (filters) — still section-level, not per leaf page unless shared

**Shared by children:** e.g. all `/teams/[teamId]/*` use one **teams section layout** so tabs don’t remount when switching members → settings.

```text
module/teams/client/studio/
├── layout/client.section.layout.tsx    # Tier 2: sub-header + outlet for children
├── layout/client.section.tabs.tsx      # optional tab config
├── skeletons/client.section.skeleton.tsx
└── config/client.teams.routes.ts       # tab paths, labels, guards
```

Apps:

```text
apps/studio/…/[org]/teams/[teamId]/layout.tsx
  → import { TeamsSectionLayout } from "@module/teams/client/studio/layout/…"
  → {children}
```

| Module     | Sub-header tabs?             | Sidebar note                 |
| ---------- | ---------------------------- | ---------------------------- |
| `teams`    | Yes (overview, members, …)   | Highlight “Teams” group      |
| `overview` | Often no                     | Org home links               |
| `projects` | Yes (env, apps, settings, …) | Project-scoped sidebar block |
| `support`  | Maybe partial                | Support-only nav slice       |

**Rule:** If two pages share the same sub-header, they **must** share the same **Tier 2 layout** file.

---

## Layout + rendering + states (combined)

```text
StudioShellLayout (Tier 1)                    ← stable across navigation
  ├── loading: rarely at this level
  └── TeamsSectionLayout (Tier 2)
        ├── sub-header (server; tabs server or client island via dynamic)
        ├── loading.tsx → section skeleton (same sub-header height)
        ├── error.tsx   → content slot only
        └── page.tsx    → loadTeamPage() → props → content
              └── dynamic client islands + ViewState boundary
```

| Concern                                       | Doc                              |
| --------------------------------------------- | -------------------------------- |
| Logic in functions, components render props   | [rendering.md](./rendering.md)   |
| `loading` / `error` / `not-found` / forbidden | [app-states.md](./app-states.md) |
| Server fetch, oRPC                            | [server-api.md](./server-api.md) |
| `utils` / `server` / `client` folders         | [modules.md](./modules.md)       |

**Layout shift:** Tier 1 unchanged when moving within Tier 2; Tier 2 sub-header unchanged when switching child pages; **`loading.tsx`** on the **segment that fetches** uses skeletons that reserve **sub-header + content** height ([app-states.md](./app-states.md)).

---

## File naming (layouts)

Full rules: **[naming.md](./naming.md)**.

| Slug       | Example                                                                               | Tier     |
| ---------- | ------------------------------------------------------------------------------------- | -------- |
| `shell`    | `client.shell.layout.tsx`, `client.shell.sidebar.tsx`                                 | 1        |
| `section`  | `client.section.layout.tsx`, `client.section.tabs.tsx`, `client.section.skeleton.tsx` | 2        |
| `<screen>` | `client.overview.page.tsx` in `rsc/`                                                  | Page RSC |

Layouts are **Server Components** unless a small client island (e.g. tab highlight) is loaded with **`dynamic()` + skeleton** ([rendering.md](./rendering.md)).

---

## Migration (discard old layout)

1. Introduce **`module/studio-shell`** (Tier 1) and one pilot module **`teams`** (Tier 2 + pages).
2. Point `(shell)/layout.tsx` and `teams/…/layout.tsx` at module layouts only.
3. Remove **`apps/studio/src/components/layout`** usage from migrated routes; delete legacy when unused.
4. Move route-specific skeletons to **`module/<feature>/client/…/skeletons/`**.
5. Document each module’s route prefix in **`module/<feature>/config/`** or `utils/constants`.

---

## Checklist (new module route area)

- [ ] Route prefix owned by one `module/<feature>/`.
- [ ] Tier 2 `client.section.layout.tsx` if multiple child pages share sub-header/tabs.
- [ ] Sidebar/header slots fed by module config, not hard-coded in shell.
- [ ] App `layout.tsx` / `page.tsx` import-only.
- [ ] Segment `loading.tsx` / `error.tsx` match section geometry.
- [ ] [CHANGELOG.md](../CHANGELOG.md) when merged to `dev`.

---

## Related

- [modules.md](./modules.md)
- [rendering.md](./rendering.md)
- [app-states.md](./app-states.md)
