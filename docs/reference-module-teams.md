# Reference module: teams

**Operational runbook (agents read this first):** [module/teams/README.md](../module/teams/README.md)

This file is a **structural reference** (directory tree, naming) for copying layout to other domains — not migration steps or verification commands.

Related: [modules.md](./modules.md), [layouts.md](./layouts.md), [new-feature-checklist.md](./new-feature-checklist.md).

---

## Directory tree (target)

```text
module/teams/
├── utils/
│   ├── constants/utils.query-keys.constants.ts
│   └── validation/
│       ├── utils.team-id.validation.ts
│       └── utils.create-team.validation.ts
├── server/
│   ├── service/
│   │   ├── server.team-get.service.ts
│   │   └── server.team-create.service.ts
│   ├── controller/
│   │   ├── server.team-get.controller.ts
│   │   └── server.team-create.controller.ts
│   └── page/
│       └── server.team-overview.page.ts
└── client/
    └── studio/
        ├── config/client.routes.ts
        ├── layout/
        │   ├── client.section.layout.tsx
        │   └── client.section.tabs.tsx
        ├── skeletons/client.team-overview.skeleton.tsx
        ├── rsc/client.overview.page.tsx          # optional: wraps loader + layout
        ├── components/
        │   ├── client.overview.boundary.tsx
        │   └── client.overview.content.tsx
        └── hooks/
            ├── client.use-teams-get.hook.ts
            └── client.use-teams-create.hook.ts
```

---

## Example: read path (team overview)

### 1. Validation (`utils/validation/utils.team-get.validation.ts`)

- Export `teamGetInputSchema` in `utils/validation/utils.team-get.validation.ts`.

### 2. Service (`server/service/server.team-get.service.ts`)

- Load team from DB; check org membership in service layer.
- Return **`ServiceOutcome<TeamDto>`** — `failed` for not found / not allowed, `error` for DB fault.

### 3. Controller (`server/controller/server.team-get.controller.ts`)

- Parse input; for reads, call service directly or **`runAction`** with `audit: false` per registry.
- Map to **`createSuccess` / `createFailed` / `createError`**; **`serviceResponseSchema.parse`**.

### 4. oRPC (`packages/api/src/orpc/procedures/teams.ts`)

- `teamGet` procedure → **`teamGetController({ input, ctx: context })`**.

### 5. Page loader (`server/page/server.team-overview.page.ts`)

- Accept route params; call **`teamGetController`** (same as oRPC).
- Return props for RSC (response or unwrapped DTO + status for boundary).

### 6. App page (`apps/studio/src/app/.../teams/[teamId]/page.tsx`)

```tsx
export { TeamOverviewPage as default } from "@module/teams/client/studio/rsc/client.overview.page";
```

Or explicit loader + content — logic stays in module ([server-api.md](./server-api.md)).

### 7. Client

- **`useTeamGet`**: oRPC query, `initialData` from server, query key from `query-keys.ts`.
- **`client.overview.boundary`**: `isPending` → skeleton; then switch on **`ServiceResponse.status`**.
- Heavy panel: **`dynamic()`** + **`client.team-overview.skeleton`**.

---

## Example: write path (create team)

### 1. Registry

- Action ID e.g. **`team.create`** in `registry-data.ts` ([product.md](./product.md)).

### 2. Service + controller

- Controller **`return runAction({ action: "team.create", ctx, handler: () => teamCreateService(...) })`**.

### 3. Hook

- **`useTeamCreate`**: mutation → oRPC → **`applyResponseToast`** → invalidate `query-keys`.

### 4. UI

- Button wrapped with **`useCan("team.create")`**; **`trackActionIntent("team.create")`** on click.

---

## Tier 2 layout

- All routes under `/…/teams/…` share **`TeamsSectionLayout`** from `client.section.layout.tsx`.
- Tabs from **`client.routes.ts`**; active tab from pathname.

---

## Tier 1

- Wrapped by **`@module/studio-shell`** in app layout — not implemented inside `module/teams`.

---

## Related

- [gaps/contracts.md](./gaps/contracts.md)  
- [gaps/actions-audit.md](./gaps/actions-audit.md)  
