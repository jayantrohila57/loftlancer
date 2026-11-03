# Domain modules (`module/`)

**`module/`** is the **Modules** layer in **Apps → Modules → Features → Packages** ([features.md](./features.md)). It holds **complete domain-specific functionality**: server APIs, business logic, repositories, policies, action IDs, schemas, types, and domain client UI (teams, organizations, account, …).

**Follow this document whenever you create or change domain behavior** — API operations, validation, Studio/Auth UI, hooks, loaders. Cross-domain reusable systems live in **`features/`**; vendor SDK wiring lives in **`packages/`** ([packages.md](./packages.md)).

Legacy paths (`apps/studio/src/module/*`, `packages/api/src/modules/*`, fat router bodies) still exist during migration. **New work goes in `module/<feature>/` only**; move old code when your issue includes that domain.

---

## What a module is

- **One folder per product domain:** `module/teams/`, `module/projects/`, … (see [module/README.md](../module/README.md) for the current domain list).
- **Not a pnpm package** — plain source under the repo root, imported via path alias (e.g. `@module/*` when configured).
- **Owns the feature end-to-end:** validation, server behavior, client UI, and **its route section layout** (Tier 2) — see [layouts.md](./layouts.md).

---

## Internal layout (`module/<feature>/`)

Each domain uses three top-level folders. Subfolders group files by role; **file names use a layer prefix** (see [Naming](#naming)).

```text
module/<feature>/
├── utils/
│   ├── types/           # DTOs, param types, z.infer aliases — no Zod definitions here
│   ├── validation/      # Zod schemas (shared by server, forms, and router .input())
│   └── state/           # ViewState / mappers; prefer ServiceResponse ([data-workflow.md](./data-workflow.md))
├── server/
│   ├── controller/      # One operation per file: parse input, call service, return DTO
│   └── service/         # Business logic: DB, requireAction, audit, notifications
└── client/
    └── studio/          # Studio app UI (use client/auth/ for Auth-only screens)
        ├── layout/        # Tier 2 — sub-header, tabs ([layouts.md](./layouts.md))
        ├── config/        # Routes, tabs, sidebar hints for this module
        ├── loaders/     # server-only prefetch / dehydrate (import "server-only")
        ├── rsc/         # Server Components — wiring only, no "use client"
        ├── skeletons/   # Loading UI for Suspense / dynamic()
        ├── components/  # Client leaves ("use client") + optional boundary per screen
        └── hooks/       # oRPC + TanStack Query; mutations; tabs, filters
```

Optional: `client/studio/state/` for client-only view-state hooks if you prefer not to colocate them in `hooks/`.

### `utils/`

| Subfolder | Holds | Example files |
|-----------|--------|-----------------|
| `types/` | Shapes returned to UI or API clients | `utils.team.dto.ts`, `utils.member.dto.ts` |
| `validation/` | Zod + exported input types | `utils.create-team.validation.ts`, `utils.team-id.validation.ts` |
| `state/` | Shared UI status model | `utils.response-to-ui.mapper.ts` |

Pure helpers (formatters, URL parsers) live in `utils/` as `utils.<name>.ts` or `utils/<name>.ts` next to subfolders — keep them free of React and DB.

### `server/`

| Subfolder | Holds |
|-----------|--------|
| `controller/` | Entry from oRPC, MCP, Server Actions, route handlers, RSC loaders: validate, call service |
| `service/` | Domain rules and persistence; may call `requireAction`, write audit, use `@loftlancer/db` |

One **read or write operation** → pair `server.<op>.ts` (controller) + `server.<op>.service.ts` (service) unless the op is trivial enough to keep a single service file.

Optional subfolders under `server/`: `handlers/` (Next `route.ts` targets), `actions/` (Server Action entrypoints), `page/` (RSC data loaders for pages).

Permission checks: `requireAction` / registry in **service or controller**; oRPC middleware in `@loftlancer/api` may mirror `actionGuard` — see [product.md](./product.md) and [server-api.md](./server-api.md).

### `client/`

| Subfolder | Holds |
|-----------|--------|
| `loaders/` | Server-side data prep for a route or layout (no `"use client"`) |
| `rsc/` | Page/shell Server Components: metadata wiring, `<Suspense>`, `next/dynamic` |
| `skeletons/` | Fallback UI matching `rsc/` and boundaries |
| `components/` | Interactive UI; **`"use client"` only here** (and in `hooks/` if needed) |
| `hooks/` | oRPC client hooks; form submit via oRPC or Server Action that calls same controller |

Per **screen**: module **server** loads data → app **page** passes props → **client** component. Client refetch uses oRPC hooks when needed. Details: [server-api.md](./server-api.md).

---

## Naming

**Canonical spec:** [naming.md](./naming.md) — layer **prefix** (`utils.` | `server.` | `client.`), kebab **slug**, **role postfix** before extension (searchable).

Summary:

| Layer | Pattern | Example |
|--------|---------|---------|
| `utils.` | `utils.<topic>.validation.ts`, `utils.<topic>.dto.ts` | `utils.create-team.validation.ts` |
| `server.` | `server.<op>.controller.ts` + `server.<op>.service.ts` | `server.get-team.controller.ts` |
| `client.` | `client.<screen>.<role>.tsx`, hooks `client.use-<feature>-<op>.hook.ts` | `client.overview.boundary.tsx` |

Tests: `server.get-team.service.test.ts` next to the source file.

Legacy examples in migration code may omit postfixes; **new files follow [naming.md](./naming.md).**

**Import alias:** `@module/<feature>/…` — see [docs/tooling.md](../docs/tooling.md) and [docs/gaps/imports-paths.md](../docs/gaps/imports-paths.md).

**Cross-domain helpers (still module layer):** `module/shared/` — see [module/shared/README.md](../module/shared/README.md). Prefer **`features/`** when logic is domain-independent and consumed by many modules ([features.md](./features.md)).

---

## Client architecture (five rules)

See **[rendering.md](./rendering.md)** and **[app-states.md](./app-states.md)** for composition and route-level loading/error/forbidden/not-found. **Agent skills:** **[ui-ux-skills.md](./ui-ux-skills.md)** (read before any UI work).

1. **Server-first** — Data loading in `module/…/server` (or RSC helpers in module); app `page.tsx` only calls module and passes props to child components.
2. **Client at the leaves** — Interactive slices only; load with **`next/dynamic`** + skeleton inside server parents ([rendering.md](./rendering.md)).
3. **Validated and type-safe** — Single Zod in `utils/validation/`; forms and oRPC inputs reuse schemas.
4. **Logic in functions** — Fetch, query state, filters, and mutations live in server loaders or client hooks; components render **final values** only.
5. **Unified responses** — Server returns **ServiceResponse** (`success` \| `failed` \| `error`); UI toast + boundary ([data-workflow.md](./data-workflow.md)). Route loading stays in App Router ([app-states.md](./app-states.md)).

---

## Example: `module/teams/` (reference)

```text
module/teams/
├── utils/
│   ├── types/utils.team.dto.ts
│   ├── validation/utils.team-id.ts
│   ├── validation/utils.create-team.ts
│   └── state/utils.view-state.ts
├── server/
│   ├── controller/server.list-teams.controller.ts
│   ├── controller/server.get-team.controller.ts
│   ├── service/server.list-teams.service.ts
│   └── service/server.get-team.service.ts
└── client/studio/
    ├── rsc/client.overview.page.tsx
    ├── skeletons/client.overview.skeleton.tsx
    ├── hooks/client.use-team-get.hook.ts
    └── components/
        ├── client.overview.boundary.tsx
        └── client.overview.content.tsx
```

Repeat per screen and per server operation in other domains.

---

## What modules are responsible for

| Responsibility | Module |
|----------------|--------|
| Zod schemas and DTO types for the feature | `module/<feature>/utils/` |
| Server operations (DB, permissions, audit, oRPC/MCP/action/route implementations) | `module/<feature>/server/` |
| Screens, components, hooks, loaders for the feature | `module/<feature>/client/` |
| Mapping domain errors to UI states (loading, empty, error, …) | `module/<feature>/utils/` and `client/` |
| Tests for feature behavior | Next to the code under `module/<feature>/` |

Permissions: **`@loftlancer/actions`** registry + **`runAction`** wrapper — audit **success, denied, failure** on mutations ([actions-and-events.md](./actions-and-events.md), [data-workflow.md](./data-workflow.md)).

---

## What modules must not do

- **Do not** implement generic infra (DB schema, auth server, design system) — use `packages/`.
- **Do not** define oRPC procedure **implementations** in `apps/` or fat bodies in `packages/api` — wire in `@loftlancer/api`, logic in **`module/…/server`** ([server-api.md](./server-api.md)).
- **Do not** import from `apps/*/src` (no `@/` app internals from module code).
- **Do not** import `module/<feature>/server` from **client components** — pass props from server pages or call **oRPC** from hooks.

---

## How modules connect to server APIs

```text
Browser (oRPC) / MCP / Server Action / route.ts / RSC page
    ↓
module/<feature>/server/controller → service
    ↓
module/<feature>/utils + @loftlancer/db + @loftlancer/actions
```

- **oRPC** is the only RPC protocol for new work; procedure shells live in `@loftlancer/api`, implementations in **`module/`**. tRPC is removed over time ([server-api.md](./server-api.md)).
- **Next `app/`** files import and call module server — no domain logic in apps.
- MCP tools return **ServiceResponse** shape (or equivalent fields) — [data-workflow.md](./data-workflow.md)

---

## How modules connect to apps (UI)

```text
apps/…/layout.tsx (Tier 1)     → module/studio-shell/…  ([layouts.md](./layouts.md))
apps/…/<module>/layout.tsx     → module/<feature>/client/studio/layout/  (Tier 2)
apps/…/page.tsx                → server load + module page; props → components
```

App route files are **bare**; layouts and UI live in **`module/`**.

---

## Module rules (summary)

1. **Feature ownership** — If it only exists because of one domain, it lives under that `module/<feature>/`.
2. **Server-first** — Loaders + RSC; client components at the leaves ([Client architecture](#client-architecture-five-rules)).
3. **Single validation source** — `utils/validation/`; routers import schemas for `.input()`.
4. **Transport vs logic** — oRPC/MCP/action/route **wiring** in `packages/api` or thin app files; **all logic** in `module/…/server`.
5. **No new tRPC** — oRPC + module server only ([server-api.md](./server-api.md)).
6. **ServiceResponse everywhere** — same JSON for oRPC, actions, routes, MCP ([data-workflow.md](./data-workflow.md)).

---

## Checklist (new or changed feature)

- [ ] GitHub issue; registry updated if gated ([product.md](./product.md)).
- [ ] Code under `module/<feature>/` using [internal layout](#internal-layout-modulefeature) and [naming.md](./naming.md).
- [ ] Controller returns validated **ServiceResponse** ([data-workflow.md](./data-workflow.md)).
- [ ] Client screen set: rsc + skeleton + boundary states where applicable.
- [ ] UI skills applied per [ui-ux-skills.md](./ui-ux-skills.md); audit pass (**web-design-guidelines** or **ui-ux-pro-max**) before merge.
- [ ] oRPC (or shared controller for action/route) delegates to `module/<feature>/server`.
- [ ] App / route files: import and call only.
- [ ] [CHANGELOG.md](../CHANGELOG.md) `[Unreleased]` when merged to `dev`.

---

## Related

- [data-workflow.md](./data-workflow.md) — ServiceResponse, toast, UI by status  
- [rendering.md](./rendering.md) — page composition, dynamic islands  , logic vs render  
- [ui-ux-skills.md](./ui-ux-skills.md) — agent skills for UI/UX (shadcn, coss, ui-ux-pro-max, …)  
- [server-api.md](./server-api.md) — oRPC, Server Actions, Next routes, pages  
- [features.md](./features.md) — reusable features layer and dependency rules  
- [packages.md](./packages.md) — platform packages and `@loftlancer/api` boundaries  
- [product.md](./product.md) — permissions, audit, MCP exposure  
- [index.md](./index.md) — doc map  
- [../AGENTS.md](../AGENTS.md) — workflow  
