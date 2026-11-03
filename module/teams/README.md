# Teams module

Parent issues: **#916**, **#918** (migration completion). Studio routes: `/[org]/teams`, `/[org]/teams/[teamId]/…`.

All `/[org]/teams` routes use module page loaders, the same controllers as native oRPC, validated ServiceResponse output, and dynamic client boundaries. Team detail routes share `TeamsSectionLayout`; the existing Studio shell remains in place.

**Agents:** read this file before editing `module/teams/`. Structural tree: [docs/reference-module-teams.md](../../docs/reference-module-teams.md). **Codex:** [AGENTS.md](./AGENTS.md). **Cursor:** [.cursor/rules/agent-workflow.mdc](../../.cursor/rules/agent-workflow.mdc) / root [AGENTS.md](../../AGENTS.md).

---

## Agent workflow

1. Pick a **sub-issue** — not an entire parent issue in one PR.
2. Branch from **`dev`**: `feat/<issue>-<slug>`.
3. **Plan** before code if the slice spans utils + server + oRPC + client.
4. **Reference** `module/teams/` and `module/shared/` — not legacy `apps/studio/src/module/*` or `packages/api/src/modules/*` as templates.
5. One **commit per sub-issue** (`Fixes #sub`); before PR to **`dev`**: **`pnpm verify:dev-merge`**.

---

## Flow

`app route re-export → module RSC → server/page → controller → runAction → service`

`client hook → @/lib/orpc → packages/api/src/orpc/procedures/teams.ts → same controller`

`runAction` authorizes with the platform evaluator using `audit: false`, then records one terminal mutation outcome. It maps permission denial to `failed`, preserves field errors, and returns safe error details for unexpected failures. Create inserts the team and its creator's lead membership in one transaction. Member services retain organization checks, last-lead protection, and linked-project defaults.

The native teams namespace includes list, get, create, update, delete, restore, members, availableMembers, addMember, removeMember, updateMemberRole, projects, linkableProjects, projectAssign, projectRemove, invitationList, invitationContext, invitationCreate, invitationResend, and invitationRevoke. Controllers own runtime Zod validation, and each oRPC procedure declares the matching per-operation input schema. Compatibility consumers receive the validated `ServiceResponse`; tRPC/MCP adapters unwrap it at the transport boundary.

---

## Completed migration (#918)

- Every team screen has a module RSC loader, a dynamic response boundary, and a props-only content component. Query and mutation hooks own transport, state, invalidation, and toasts. Server responses hydrate the initial list, overview, members, projects, invitations, and settings queries.
- Invitations use native `invitationList`, `invitationContext`, `invitationCreate`, `invitationResend`, and `invitationRevoke` controllers. Bulk email parsing is shared with organization consumers; the module owns its preview, organization-role selection, retry state, and guarded dialog. The server independently enforces organization/team scope, active membership, assignable roles, pending-invitation uniqueness, and email delivery. Failed initial delivery cancels the pending invitation.
- Project links use native `projectAssign` and `projectRemove` controllers with both assignment and project-read permission checks. Compatibility project-access writes call those same controllers. Existing shared project-team persistence preserves default grants, link restoration, and saved individual access settings.
- Organization/MCP invitation creation shares the extracted organization persistence/delivery service. Global organization invitation routes remain owned by that feature; teams clients no longer call them.
- Generic table headers/actions, required-field hints, settings rows, and guarded-dialog infrastructure live in `@loftlancer/ui`; existing app import paths re-export them for compatibility. Teams has no imports from Studio components, domains, tRPC, auth client, or `lib/team-*` bridges.
- The only app-specific ports are `@/lib/orpc` in transport hooks and the cached `@/lib/server-auth` session accessor in the server page context loader. They supply platform transport and authenticated request context, rather than feature business logic.
- A small shared `ModuleScopeProvider` carries the server-resolved organization ID to client permission/query hooks. It renders no UI; visible team islands remain dynamic with skeleton fallbacks. Permission reads use the existing oRPC snapshot endpoint and never audit.
- `runAction.authorize` supports additional permission gates before a handler runs, while recording one terminal mutation audit. Read/context operations set `audit: false`.
- Module-only typecheck covers shared contracts and teams server/utils. Studio covers RSC/client sources. The existing `@loftlancer/module-shared` workspace supplies dependencies for root module source; no teams package was added. Turbo hashes `module/**`, and Studio Tailwind scans it.

**Do not copy as templates:** `packages/api/src/modules/teams/*` (read-only compat), removed `apps/studio/src/lib/team-*`.

---

## Verification

**Per sub-issue:**

```bash
pnpm audit:module-architecture
pnpm check-types
pnpm test:teams
```

**Before PR to `dev`:**

```bash
pnpm verify:dev-merge
```

- `TEST_TEAMS_DATABASE_URL=postgresql://.../loftlancer_teams_916 pnpm test:teams:integration` — opt-in smoke (local disposable DB only).
- `TEST_TEAMS_MIGRATION_DATABASE_URL=postgresql://.../loftlancer_teams_918 pnpm test:teams:integration` — migration integration (grants, invitations, audits; email mocked).

Browser QA: create → overview, all tabs, project link/unlink, invitations, keyboard/dialog, 375px layout.

---

## Migration verification (#918)

- Workspace typechecks: all tasks passed; API, Studio, and shared/controller tests passed.
- Isolated Postgres integration verified invitation validation, duplicates, scope, resend/revoke, project grants, link restoration, and terminal audits.
- Authenticated local browser verified every team tab and native flows. Shell-level Base UI warnings remain outside team islands.

---

## Architecture verification (#920)

The architecture burn-down is implemented on `feat/920-teams-architecture-100` and is awaiting PR verification. All team controllers validate outbound `ServiceResponse` data, oRPC procedures use operation-specific schemas, and the legacy API returns the controller response without unwrapping it. The architecture audit baseline has no known violation ids.

Verification: `pnpm audit:module-architecture --strict`, `pnpm check-types`, and `pnpm test:teams` pass per slice. The full `pnpm verify:dev-merge` result is recorded after the final branch check.

Pilot checklist items in git history **do not override** CI or the audit.

---

## Sub-issues

Track open chunks in GitHub; update this table when filing sub-tasks.

| Sub-issue | Scope | Status |
|-----------|--------|--------|
| #916 / #918 | Parent migration | merged to `dev` |
| [#920](https://github.com/jayantrohila57/loftlancer/issues/920) | Architecture 100% parent | open |
| [#921](https://github.com/jayantrohila57/loftlancer/issues/921) | A — controller outbound parse | implemented in PR branch |
| [#922](https://github.com/jayantrohila57/loftlancer/issues/922) | B — oRPC Zod inputs | implemented in PR branch |
| [#923](https://github.com/jayantrohila57/loftlancer/issues/923) | C — legacy unwrap | implemented in PR branch |
| [#924](https://github.com/jayantrohila57/loftlancer/issues/924) | D — empty baseline + docs | implemented in PR branch |
| [#1063](https://github.com/jayantrohila57/loftlancer/issues/1063) | E — overview server-first leaves | done (overview) |
| [#1065](https://github.com/jayantrohila57/loftlancer/issues/1065) | F — list server-first screen | done (list) |

GitHub exposed no open Loftlancer project when issue #916 was created, so no project item could be attached.

---

## Client rendering (server-first leaves)

Pilot for [docs/rendering.md](../../docs/rendering.md) and [docs/gaps/client-layer.md](../../docs/gaps/client-layer.md). Organizations UI follows after teams patterns are stable.

**Verified (this branch):**

- **Team overview** (`rsc/client.overview.page.tsx`): RSC loader passes serializable props; `dynamic()` boundary owns `useTeamGet` + status switching; profile + access-guide sections are **Server Components** with `dynamic()` leaves for `AccordionSection` / `LocalDateTime`; static copy is not behind `"use client"`.
- **Teams list** (`rsc/client.list.page.tsx`): RSC owns header copy (`client.list.header.section.tsx`); `dynamic()` create-team island + list boundary; boundary keeps `useTeamsList` + ServiceResponse; `DataTable` loads via `dynamic()` in `client.list.content.tsx`.

```bash
pnpm audit:module-architecture
pnpm check-types
pnpm test:teams
```

### Client rendering (TODO — priority)

| Screen | Files | Notes |
|--------|--------|--------|
| ~~Teams list~~ | — | done on this branch |
| Settings | `client.settings.content.tsx` | Mostly static rows — server sections + mutation leaves |
| Members | `client.members.content.tsx` | Table + role controls — split read-only columns to RSC where possible |
| Projects | `client.projects.content.tsx` | Link/unlink actions as client leaves |
| Invitations | `client.invitations.content.tsx`, `client.invitation-controls.tsx` | Controls leaf already isolated; table + bulk actions next |
| Section tabs | `client.section.tabs.tsx` | Keep client; ensure imported only via `dynamic()` from RSC layouts |
