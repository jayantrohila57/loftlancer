# File and folder naming

Searchable, consistent names for **`module/`**, **`module/shared/`**, and thin **`packages/api`** wiring. Every product file uses a **layer prefix** and, when the folder alone is not enough, a **role postfix** before the extension.

**Goal:** find all controllers with `server.*.controller.ts`, all team validation with `utils.team`, all overview UI with `client.overview.`.

Related: [modules.md](./modules.md), [layouts.md](./layouts.md), [reference-module-teams.md](./reference-module-teams.md).

**Cursor rule:** [.cursor/rules/naming.mdc](../.cursor/rules/naming.mdc)

---

## Pattern

```text
<layer>.<slug>.<role>.<ext>
```

| Part | Required | Values |
|------|----------|--------|
| **layer** | Yes | `utils` \| `server` \| `client` |
| **slug** | Yes | kebab-case — operation, screen, or domain slice (`team-get`, `overview`, `section`, `shell`) |
| **role** | Usually | See [Role postfixes](#role-postfixes) — omit only when folder + slug already imply role (discouraged) |
| **ext** | Yes | `ts`, `tsx`, `test.ts` |

**Separator:** dot (`.`). **Slug words:** kebab-case (`team-create`, not `teamCreate` or `team_create`).

### Examples (correct)

| File | Search hint |
|------|-------------|
| `server.team-get.controller.ts` | `server.` + `.controller` |
| `server.team-get.service.ts` | `server.` + `.service` |
| `utils.team-create.validation.ts` | `utils.` + `.validation` |
| `client.overview.boundary.tsx` | `client.overview` |
| `client.use-team-get.hook.ts` | `client.use-` + `.hook` |

### Forbidden

| Pattern | Why |
|---------|-----|
| `get-team.ts` (no layer prefix) | Breaks repo-wide search |
| `serverGetTeam.ts` (camelCase file) | Inconsistent with kebab slug |
| `teams-controller.ts` (suffix first) | Postfix must be immediately before extension |
| Same slug, different roles without postfix | e.g. two files both named `server.team-get.ts` in different folders — use `.controller` / `.service` |

---

## Role postfixes

Use the postfix that matches **one primary job**. Folder name does not replace postfix when multiple roles share a folder.

### `utils/`

| Postfix | Folder | Example |
|---------|--------|---------|
| `.validation.ts` | `utils/validation/` | `utils.team-id.validation.ts` |
| `.dto.ts` | `utils/types/` | `utils.team.dto.ts` |
| `.types.ts` | `utils/types/` | `utils.service-response.types.ts` (shared type surface) |
| `.constants.ts` | `utils/constants/` | `utils.query-keys.constants.ts` |
| `.mapper.ts` | `utils/state/` | `utils.response-to-ui.mapper.ts` |
| (none) | `utils/` root | Pure helpers: `utils.format-team-label.ts` — rare; prefer subfolder |

### `server/`

| Postfix | Folder | Example |
|---------|--------|---------|
| `.controller.ts` | `server/controller/` | `server.team-list.controller.ts` |
| `.service.ts` | `server/service/` | `server.team-list.service.ts` |
| `.page.ts` | `server/page/` | `server.team-overview.page.ts` |
| `.handler.ts` | `server/handlers/` | `server.file-download.handler.ts` |
| `.action.ts` | `server/actions/` | `server.team-create.action.ts` |
| `.event.ts` | `server/events/` | `server.team-created.event.ts` |

**Pair rule:** one operation → `server.<op>.controller.ts` + `server.<op>.service.ts` with the **same `<op>` slug**.

### `client/`

| Postfix | Folder | Example |
|---------|--------|---------|
| `.layout.tsx` | `…/layout/` | `client.section.layout.tsx`, `client.shell.layout.tsx` |
| `.tabs.tsx` | `…/layout/` | `client.section.tabs.tsx` |
| `.routes.ts` | `…/config/` | `client.routes.ts` or `client.teams.routes.ts` |
| `.page.tsx` | `…/rsc/` | `client.overview.page.tsx` |
| `.skeleton.tsx` | `…/skeletons/` | `client.overview.skeleton.tsx` |
| `.boundary.tsx` | `…/components/` | `client.overview.boundary.tsx` |
| `.content.tsx` | `…/components/` | `client.overview.content.tsx` |
| `.panel.tsx` | `…/components/` | `client.members.panel.tsx` (heavy client island) |
| `.form.tsx` | `…/components/` | `client.settings.form.tsx` |
| `.error.tsx` | `…/components/` | `client.overview.error.tsx` (route error UI) |
| `.hook.ts` | `…/hooks/` | `client.use-team-get.hook.ts` |
| `.loader.ts` | `…/loaders/` | **Legacy** — prefer `server.<screen>.page.ts` |

**Hook slug:** `client.use-<feature>-<operation>.hook.ts` (feature matches module name when ambiguous: `use-teams-get` in `module/teams`).

### Tests

Colocate: **`server.team-get.service.test.ts`** next to **`server.team-get.service.ts`** (full name + `.test.ts`).

---

## Slug vocabulary

| Use | Slug style | Examples |
|-----|------------|----------|
| CRUD / API operation | `<noun>-<verb>` or `<verb>-<noun>` — pick one module-wide | `team-get`, `team-create`, `team-list` |
| Screen / route area | short area name | `overview`, `members`, `settings` |
| Section chrome | fixed tokens | `section`, `shell` |
| Shared module file | topic | `service-response`, `run-action` |

Keep slugs **stable** when renaming UI copy; do not embed user-facing titles in filenames.

---

## Folder naming

Folders group by **role** and **app surface**. Use lowercase, kebab-case, no layer prefix on folder names (the **file** carries `utils.` / `server.` / `client.`).

### `module/<feature>/` (fixed top level)

```text
module/<feature>/
├── utils/
│   ├── types/
│   ├── validation/
│   ├── constants/
│   └── state/
├── server/
│   ├── controller/
│   ├── service/
│   ├── page/
│   ├── handlers/      # optional
│   ├── actions/       # optional
│   └── events/        # optional
└── client/
    └── studio/        # or auth/ — app target (folder = surface, not prefix on every file)
        ├── layout/
        ├── config/
        ├── rsc/
        ├── skeletons/
        ├── components/
        └── hooks/
```

| Folder | Meaning |
|--------|---------|
| `client/studio/` | Studio-only UI |
| `client/auth/` | Auth app-only UI |
| `server/page/` | RSC data loaders (server-only) |

**Optional prefixed subfolder** when one module has two Studio sections (rare):

```text
client/studio/teams-layout/   # only if two Tier-2 sections in one module
```

Prefer **`module/teams`** split over deep prefixed folders.

### `module/shared/`

Same layer prefixes; slugs describe cross-feature concern:

```text
module/shared/utils/validation/utils.service-response.validation.ts
module/shared/server/run-action.ts          # platform-style name OK when single file
module/shared/client/apply-response-toast.ts  # kebab file — shared entry; layer via path + export
```

For **new** shared files, prefer **`utils.<topic>.<role>.ts`** under typed subfolders. Legacy kebab filenames in `shared/` may stay until touched.

### `module/studio-shell/` / `module/account/`

Mirror `client/studio/layout/` + `client.shell.*` / account equivalents — see [layouts.md](./layouts.md).

---

## Layout and config (Tier 1 / Tier 2)

| Tier | File pattern |
|------|----------------|
| 1 shell | `client.shell.layout.tsx`, `client.shell.sidebar.tsx`, `client.nav-by-module.routes.ts` |
| 2 section | `client.section.layout.tsx`, `client.section.tabs.tsx`, `client.section.skeleton.tsx` |
| Module routes | `client.routes.ts` in `client/.../config/` |

Slug **`section`** = Tier 2 module chrome; **`shell`** = Tier 1 app chrome.

---

## `packages/api` (transport only)

New oRPC procedure files:

```text
packages/api/src/orpc/procedures/<domain>.ts   # export named procedures
```

Inside file, exports match operation slugs (`teamGet`, `teamList`) — implementation calls `@module/.../server/.../server.team-get.controller.ts`.

Do **not** add `packages/api/src/modules/<domain>/` for new product logic ([forbidden-defaults.md](./gaps/forbidden-defaults.md)).

---

## Quick search cheatsheet

| I want… | Ripgrep pattern |
|---------|-----------------|
| All server controllers | `server\..*\.controller\.ts` |
| All services for teams module | path `module/teams` + `\.service\.ts` |
| All overview client UI | `client\.overview\.` |
| All Zod schemas | `utils\..*\.validation\.ts` |
| All hooks | `client\.use-.*\.hook\.ts` |
| All skeletons | `client\..*\.skeleton\.tsx` |

---

## Checklist (new file)

- [ ] Starts with `utils.` \| `server.` \| `client.`
- [ ] Slug is kebab-case
- [ ] Role postfix present when type is not obvious from a unique folder convention
- [ ] Controller/service share the same operation slug
- [ ] Test file mirrors source name + `.test.ts`

---

## Related

- [gaps/server-folders.md](./gaps/server-folders.md) — which server folder  
- [gaps/client-layer.md](./gaps/client-layer.md) — boundary vs content  
- [architecture-gaps.md](./architecture-gaps.md)
