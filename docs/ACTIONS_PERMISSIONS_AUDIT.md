# Actions, permissions & audit timeline — research & design spec

**Status:** **Implemented in codebase** behind `ACTIONS_AUDIT_ENABLED` (and related migrations `0006` / combined `0007`). This document remains the **authoritative spec** for action names, roles, and timeline behavior; update the spec when adding actions.  
**Bundles with:** platform migration train (`0005`, `0006`, combined **`0007_platform_combined_for_prod.sql`** for prod).  
**Authoritative intent:** one canonical action name per user-visible or security-sensitive operation; that name drives audit logging, authorization, block lists, and UI gating.

### Phase 1 implementation scope (confirmed)

The product is **organization-level only** today: there is **no admin dashboard**, no cross-org operator UI, and no platform-wide routes.

| In scope (Phase 1) | Out of scope (later) |
|--------------------|----------------------|
| **OWNER**, **MANAGER**, **MEMBER** within the active organization | **ADMIN** (platform super admin) behavior, UI, and routes |
| Org + project permissions, teams, timeline, `requireAction` for tRPC | Better Auth **admin** plugin, `user.role`, impersonation, ban UI |
| `action_block` at **organization**, **project**, **user** scope | `action_block` at **platform** scope (schema may reserve `scope_type`) |
| Registry entries for org/project/**user** actions; account settings + Organizations module routes | Wiring `platform.*` actions (reserved names only) |

**ADMIN** remains in the **registry and permission model** (action names, evaluation order stub, matrix column) so a future platform phase can plug in without renaming. Phase 1 **`requireAction` must not treat any user as ADMIN** (`isPlatformAdmin()` always false; no admin plugin).

---

## 1. Executive summary

Today the product logs a subset of mutations to `audit_log` with ad-hoc `action` enums (`CREATE`, `UPDATE`, …) and `entityType` (`PROJECT`, `VARIABLE`, …). Access control is effectively **project owner + active org membership** (`project.userId`, `member.role` in `owner` | `admin` | `member`) with no project teams, no manager scoping, and no platform admin role in schema. The Activity page reads **only the current user’s** audit rows.

This spec introduces:

1. **`@loftlancer/actions` registry** — single source of truth for action metadata, Better Auth organization statements/roles, project-level grants, audit payloads, notification triggers, and UI `requiredAction`.
2. **`requireAction(action, ctx)`** — server gate used by tRPC (and Better Auth hooks where applicable): **(reserved: platform admin)** → block list → org role → project grant; **always** writes `audit_event` (`success` | `failure` | `denied`). Phase 1 skips the admin step.
3. **`audit_event`** — replaces `audit_log` and powers **org-wide Timeline** (replaces `/dashboard/activity`), **per-org hub Timeline**, and **account Timeline** in user settings; **OWNER** (and later ADMIN) can view any member’s timeline — Phase 1 implements OWNER only.
4. **Account settings (`/dashboard/settings`)** — **user scope only**: profile, sessions, connected accounts, export, delete, own timeline. **Org management is removed** from settings and lives in the **Organizations** module.
5. **Organizations module** — `/dashboard/organizations` list + `/dashboard/organizations/[slug]` hub (Members, Teams, Invitations, Roles & access, Settings, Timeline), parallel to Projects.
6. **Role model** — **OWNER** / **MANAGER** / **MEMBER** (org + project), aligned with Better Auth organization + **teams**. **ADMIN** is documented and reserved in the registry; not implemented in Phase 1.
7. **Project scope** — Better Auth is org/team-native; **project permissions are app tables** (`project_manager`, `project_team`, `project_member_grant`) evaluated after org role.
8. **`user` action scope** — self-service account actions use `scope: "user"`; **`requireAction` does not require an active organization** (org id in `audit_event` optional when absent).

---

## 2. Current state (repo research)

### 2.1 Audit

| Area | Finding |
|------|---------|
| Table | `audit_log` (`packages/db/src/schema/audit.ts`) — `action`, `entityType`, FKs to project/env/variable, optional JSON in `oldValue`/`newValue`/`metadata` |
| Writer | `createAuditLog()` (`packages/api/src/audit.ts`) — swallows errors; only success paths in routers |
| Actions logged | Projects, environments, variables: mostly `CREATE`/`UPDATE`/`DELETE` + `BULK_IMPORT`/`EXPORT` |
| API | `auditLogs.list` / `stats` — **filter `userId = session.user`** only (`packages/api/src/routers/audit.ts`) |
| UI | `/dashboard/activity` — org-branded copy but **personal** log (`apps/web/src/domain/audit/*`) |

**Gaps:** no failure/denied events; no canonical action names; no org-wide view; no link to permissions or notifications.

### 2.2 Access control

| Area | Finding |
|------|---------|
| Org | `requireActiveOrganization`, `member.role` check (`packages/api/src/org-access.ts`) |
| Project | `projectListFilter` / `assertProjectAccess` — **creator `project.userId`** + `organizationId` match |
| Roles in UI | `owner`, `admin`, `member` (`organization-settings-client.tsx`) |
| Platform admin | **Not configured** — no `admin()` plugin; `user` table has **no `role` column** (`schema/auth.ts`) |
| Teams | Organization plugin **not** using `teams: { enabled: true }`; **no `team` tables** in `0004_organizations.sql` |

### 2.3 API surface (candidates for registry)

| Router | Procedures |
|--------|------------|
| `projects` | `list`, `get`, `getBySlug`, `create`, `update`, `delete`, `archive`, `changeStatus`, `togglePublic` |
| `environments` | `list`, `get`, `create`, `update`, `delete` |
| `environmentVariables` | `list`, `countsByEnvironment`, `get`, `create`, `update`, `delete`, `bulkImport`, `export` |
| `auditLogs` | `list`, `stats` |
| `notifications` | `unreadCount`, `list`, `markRead`, `markUnread`, `markAllRead`, sync helpers |
| `dashboard` | stats including audit aggregates |
| Better Auth (client) | org CRUD, members, invitations, (future) teams; **account**: `updateUser`, `changeEmail`, `listSessions`, `revokeSession`, `revokeOtherSessions`, `listUserAccounts`, `linkSocial`, `unlinkAccount`, `deleteUser` |

### 2.4 Notifications (cross-link)

`@loftlancer/notifications` already uses typed events (`invitation.received`, `invitation.accepted`) with idempotency. Design: **high-signal actions** optionally emit notifications via registry `notifyOn?: NotificationType[]` keyed off successful `audit_event` (see §8).

---

## 3. Better Auth research (organization; platform admin deferred)

### 3.1 Organization access control (built-in)

Better Auth ships `createAccessControl(defaultStatements)` with resources:

- `organization`: `update`, `delete`
- `member`: `create`, `update`, `delete`
- `invitation`: `create`, `cancel`
- `team`: `create`, `update`, `delete` (when teams enabled)
- `ac`: `create`, `read`, `update`, `delete` (dynamic custom roles)

Default roles (`statement.mjs`): **owner** (full org), **admin** (no org delete), **member** (read `ac` only).

Endpoints use internal `hasPermission({ permissions, role })`. Client: `authClient.organization.hasPermission({ permission: { invitation: ['create'] } })`.

**Dynamic access control:** Better Auth's own custom role API is not the authority for organization permissions. Loftlancer stores tenant-scoped custom organization roles against canonical `ActionName` entries and evaluates them in the same server permission path as built-in roles; see §4.6.

### 3.2 Teams

Enable `organization({ teams: { enabled: true } })` → CRUD teams, add/remove team members, `setActiveTeam`. Teams are **org-scoped**, not project-scoped. **Project ↔ team** link is our `project_team` table.

### 3.3 Admin plugin (platform) — **reserved, not Phase 1**

There is **no admin dashboard** in the app; all UX lives under **organization context** (`/dashboard/*` with active org). Platform operator tooling is a **future phase**.

Better Auth’s **admin** plugin (`user` resource: `list`, `set-role`, `ban`, `impersonate`, …) is **not enabled** in Phase 1. The registry still defines `platform.*` actions and an **ADMIN** column in matrices so later work can enable the plugin and flip `isPlatformAdmin()` without renaming actions.

**Naming collision (when admin ships):** Better Auth org role `admin` (legacy) ≠ platform `admin`. Product naming:

| Product role | Phase 1 | Storage (when implemented) |
|--------------|---------|----------------------------|
| **ADMIN** (platform) | Reserved in registry only | `user.role = 'admin'` + admin plugin |
| **OWNER** | ✓ | `member.role = 'owner'` |
| **MANAGER** | ✓ | `member.role = 'manager'` (migrate from legacy org `admin`) |
| **MEMBER** (org) | ✓ | `member.role = 'member'` — team/project access only |

Org-level Better Auth `hasPermission` applies to **invitation/member/team/org** routes. **Project/env/variable** tRPC uses `requireAction` + project tables (§5).

### 3.4 Mapping registry → Better Auth

```ts
// Conceptual — generated from registry at build time
const orgAc = createAccessControl({
  organization: ["update", "delete"],
  member: ["create", "update", "delete", "list"],
  invitation: ["create", "cancel", "accept", "reject"],
  team: ["create", "update", "delete", "member_add", "member_remove"],
  timeline: ["view_org", "view_user"],
  project: ["create", "assign_manager", "assign_team"], // org-level project ops
});

const ownerRole = orgAc.newRole({ /* all org resources */ });
const managerRole = orgAc.newRole({
  member: ["list", "create"], // invite to org (member.invite)
  invitation: ["create"],
  team: ["create", "update", "member_add", "member_remove"],
  project: ["assign_team"], // only on assigned projects enforced in app layer
  timeline: ["view_org"], // scoped to assigned projects in app layer
});
const orgMemberRole = orgAc.newRole({
  timeline: [], // own user timeline only via separate action
});
```

Registry entry example:

```ts
{
  name: "member.invite",
  scope: "organization",
  baPermission: { invitation: ["create"], member: ["create"] },
  audit: { entityType: "invitation", severity: "security" },
  notifyOn: ["invitation.received"],
}
```

---

## 4. Canonical action registry

### 4.1 Naming convention

`<resource>.<verb>` lowercase, dot-separated. Use specific verbs (`reveal` not `read` for secret material). Group by domain:

- `platform.*` — **reserved** for future ADMIN (not registered in Phase 1 route map)  
- `profile.*` — **user scope** — name, avatar, email (`updateUser`, `changeEmail`)  
- `session.*` — **user scope** — `listSessions`, `revokeSession`, `revokeOtherSessions`, `revokeSessions`  
- `account.*` — **user scope** — OAuth link/unlink, delete, export (`listUserAccounts`, `linkSocial` / `linkSocialAccount`, `unlinkAccount`, `deleteUser`, `accountInfo` optional)  
- `organization.*`, `member.*`, `invitation.*`, `team.*` — **Phase 1** (Organizations module + BA org plugin)  
- `project.*`, `environment.*`, `variable.*`  
- `audit.*`, `notification.*`  

**Migration from legacy names:** `settings.profile.*` → **`profile.*`**; **`settings.organization.*` removed** — use **`organization.*`** on org hub routes only.

### 4.2 Registry record shape (TypeScript)

```ts
export type ActionScope = "platform" | "organization" | "project" | "user";

export type ActionDefinition = {
  /** Stable id, e.g. variable.reveal */
  name: string;
  scope: ActionScope;
  description: string;

  /** scope `user`: actor must be the session user (self-service). No active org required. */
  selfOnly?: boolean;

  /** Minimum org role if scope is organization or project (before project grant) */
  orgRoles?: Array<"owner" | "manager" | "member">;

  /** If true, MANAGER must have project_manager row; MEMBER must have grant */
  requiresProjectGrant?: boolean;

  /** Subset of grant keys for project members (see §6) */
  projectGrantKey?: string;

  /** Map to Better Auth hasPermission for org-scoped HTTP routes */
  baPermission?: Record<string, string[]>;

  /** Implied actions (read implied by update, etc.) */
  implies?: string[];

  audit: {
    entityType: string;
    /** Whether to capture request/response payloads in audit_event.payload */
    capturePayload?: "none" | "diff" | "metadata";
    severity?: "info" | "security" | "critical";
  };

  /** Notification types fired on success (existing @loftlancer/notifications) */
  notifyOn?: string[];

  ui?: {
    label?: string;
    /** Sidebar or route id this gates */
    surface?: string;
  };
};

export const actionRegistry: Record<ActionName, ActionDefinition> = { ... };
```

**Codegen outputs (single package):**

- `actionNames` const array  
- `orgStatements` + `orgRoles` for Better Auth  
- `projectGrantKeys` union  
- Zod `actionNameSchema` for audit API filters  
- `ACTION_SIDEBAR_MAP` for nav (§7)

### 4.6 Organization custom roles and suspension

Custom organization roles are stored per tenant in `organization_role` and
`organization_role_permission`; one optional role can be assigned to an active
organization Member through `member_organization_role` (one custom role per
Member). Only organization
owners can create, edit, delete, or assign these roles. Permission keys must
exist in the canonical action registry and be organization-scoped. Owner-only
actions, project grants, and app access are never delegated through custom
roles. Built-in Owner / Manager / Member remains the authoritative base role.
Custom organization actions add capabilities only to a Member and never bypass
project, team, app, or action-block checks. Role deletion removes its member
assignments immediately.

Assignments are intentionally single-role: there is no implicit union of
multiple custom roles. Replacing or removing the assignment immediately changes
the permission snapshot and the next server authorization check. Invitation
records retain lifecycle timestamps and the most recent send time; resend
attempt history is not presented as a timeline because the schema does not
store every attempt. Team-scoped invitations are protected by a same-organization
foreign key, and the migration fails if existing references need review.

Suspended memberships are excluded by the shared active-member query helper,
which denies application, MCP, and permission-snapshot access. Better Auth
organization endpoints also reject requests by suspended users in the target
organization. Suspension never deletes the user or changes access to other
organizations; owner memberships cannot be suspended.

### 4.3 `requireAction` middleware

```ts
type RequireActionContext = {
  session: Session;
  organizationId?: string | null;
  projectId?: string | null;
  /** target user for timeline.view.user */
  targetUserId?: string;
  trpc: { path: string; type: "query" | "mutation" };
  requestMeta: { ip?: string; userAgent?: string };
};

async function requireAction(
  action: ActionName,
  ctx: RequireActionContext,
): Promise<{ allowed: true } | never> {
  const def = actionRegistry[action];
  const startedAt = Date.now();
  let result: "success" | "denied" | "failure" = "denied";
  let denialReason: string | undefined;

  try {
    if (await isActionBlocked(action, ctx)) {
      denialReason = "blocked";
      throw forbidden();
    }

    // Phase 1: isPlatformAdmin() is a stub (always false). Future: ADMIN bypass here.
    if (await isPlatformAdmin(ctx.session.user)) {
      result = "success";
      return { allowed: true };
    }

    if (def.scope === "user") {
      const decision = await evaluateUserScope(action, ctx);
      if (!decision.allowed) {
        denialReason = decision.reason;
        throw forbidden();
      }
      result = "success";
      return { allowed: true };
    }

    const decision = await evaluateOrgAndProject(action, ctx);
    if (!decision.allowed) {
      denialReason = decision.reason;
      throw forbidden();
    }

    result = "success";
    return { allowed: true };
  } catch (e) {
    if (result !== "denied") result = "failure";
    throw e;
  } finally {
    await writeAuditEvent({
      action,
      result,
      denialReason,
      actorUserId: ctx.session.user.id,
      organizationId: ctx.organizationId,
      projectId: ctx.projectId,
      durationMs: Date.now() - startedAt,
      ...
    });
  }
}
```

**tRPC pattern:** wrap procedures with `actionProcedure("project.update")` that calls `requireAction` before handler; handler calls `auditEvent.markSuccess` with entity ids or rely on `finally` for denied/failure only — **success with entity detail** should be written in handler after mutation (or single write with `result` updated).

**Better Auth:** wrap sensitive org hooks / use BA’s internal checks aligned with `baPermission` on registry entries; still emit `audit_event` from hook for parity.

### 4.4 Evaluation order (deterministic)

1. **Block list** (`action_block`) — Phase 1: `organization` \| `project` \| `user` only (platform scope reserved in schema)  
2. **Platform ADMIN** — **reserved**; no bypass in Phase 1  
3. **User scope** — authenticated session; **self-only** unless future ADMIN; **no active org required**  
4. **Org context** — require active org (or org slug on route) when scope is `organization` or `project`  
5. **Org OWNER** — all org actions + all projects in org  
6. **Org MANAGER** — org actions allowed by `manager` org role (including **`member.invite`** and **`team.member.add`**); **`member.role.update`** and **`member.remove`** remain **OWNER-only**; project actions only if `project_manager` row exists for `projectId`  
7. **Project MEMBER** — user in team linked via `project_team` → `project_member_grant` must include `projectGrantKey`  
8. **Legacy owner** — during migration, `project.userId === actor` treated as OWNER-equivalent for that project until backfill completes  

Deny by default.

### 4.5 User-scoped registry entries (account settings)

All audited via `audit_event` (`success` \| `failure` \| `denied`). Better Auth calls run behind tRPC or auth hooks that invoke `requireAction` first.

| Action | BA / app API | Notes |
|--------|----------------|-------|
| `profile.view` | session user read | UI gate for settings shell |
| `profile.update` | `updateUser`, `changeEmail` | Name, avatar, email |
| `session.list` | `listSessions` | IP, UA, last active, current badge |
| `session.revoke` | `revokeSession` | Single device |
| `session.revoke_others` | `revokeOtherSessions` (+ `revokeSessions` if needed) | All except current |
| `account.list` | `listUserAccounts`, `accountInfo` | Connected providers metadata |
| `account.link` | `linkSocial` / `linkSocialAccount` | e.g. GitHub OAuth |
| `account.unlink` | `unlinkAccount` | Deny if last login method |
| `account.export` | app export assembler | JSON download of user-owned data |
| `account.delete` | `deleteUser` | Typed confirmation; block if sole org owner |
| `audit.timeline.view.self` | `audit_event` query | Settings → Timeline tab |

---

## 5. Role × responsibility matrix (behavioral)

*ADMIN column: future platform operator; **not implemented Phase 1**. Rows below describe intended end state; implement OWNER / MANAGER / MEMBER columns only now.*

| Capability | ADMIN (reserved) | OWNER | MANAGER | MEMBER (project) |
|------------|:-----:|:-----:|:-------:|:----------------:|
| All orgs / all projects | ✓ | — | — | — |
| Org settings, billing (future) | ✓ | ✓ | — | — |
| Members & invitations (invite) | ✓ | ✓ | ✓ (org invite) | — |
| Member role change / remove | ✓ | ✓ | — | — |
| Teams CRUD | ✓ | ✓ | ✓ (org) | — |
| Assign manager to project | ✓ | ✓ | — | — |
| Assign team to project | ✓ | ✓ | ✓ (assigned project) | — |
| Project CRUD | ✓ | ✓ (all org) | ✓ (assigned) | grant |
| Env / variable CRUD | ✓ | ✓ | ✓ (assigned) | grant |
| Variable reveal (secret) | ✓ | ✓ | ✓ (assigned) | grant |
| Org timeline | ✓ | ✓ | ✓ (assigned projects filter) | — (no team/project → empty feed) |
| Any user timeline | ✓ | ✓ | — | — |
| Own user timeline | ✓ | ✓ | ✓ | ✓ |
| Account settings (profile, sessions, accounts, export) | ✓ | ✓ (self) | ✓ (self) | ✓ (self) |
| Delete own account | ✓ | ✓* | ✓* | ✓* |
| Organizations list & hub | ✓ | ✓ | ✓ | ✓ |
| Org danger zone (transfer, delete org) | ✓ | ✓ | — | — |
| Notifications | ✓ | ✓ | ✓ | ✓ (own) |

\*Delete denied while **sole OWNER** of any organization (transfer or delete org first).

---

## 6. Full action × role matrix

**Phase 1:** Enforce **OWNER**, **MANAGER**, and **MEMBER** columns only. **ADMIN** column and `platform.*` rows are registry placeholders (no routes, no checks, no UI).

Legend:

- **Y** — allowed (org role sufficient; project scope = all org projects for OWNER, assigned projects for MANAGER)  
- **G** — allowed only with **project grant** (MEMBER via team) or explicit `project_manager` row for MANAGER where noted  
- **—** — not allowed  
- **ADMIN column** — reserved; when platform admin ships, **Y** unless platform block list says otherwise  

| Action | ADMIN (reserved) | OWNER | MANAGER | MEMBER |
|--------|:-----:|:-----:|:-------:|:------:|
| `platform.user.list` | Y | — | — | — |
| `platform.user.set_role` | Y | — | — | — |
| `platform.user.impersonate` | Y | — | — | — |
| `organization.create` | Y | Y | — | — |
| `organization.update` | Y | Y | — | — |
| `organization.delete` | Y | Y | — | — |
| `organization.list` | Y | Y | Y | Y |
| `organization.view` | Y | Y | Y | Y |
| `organization.hub.view` | Y | Y | Y | Y |
| `organization.transfer_ownership` | Y | Y | — | — |
| `organization.settings.view` | Y | Y | Y | — |
| `organization.settings.update` | Y | Y | — | — |
| `member.list` | Y | Y | Y | — |
| `member.invite` | Y | Y | Y | — |
| `member.remove` | Y | Y | — | — |
| `member.role.update` | Y | Y | — | — |
| `invitation.accept` | Y | Y | Y | Y |
| `invitation.reject` | Y | Y | Y | Y |
| `invitation.cancel` | Y | Y | — | — |
| `team.create` | Y | Y | Y | — |
| `team.update` | Y | Y | Y | — |
| `team.delete` | Y | Y | Y | — |
| `team.member.add` | Y | Y | Y | — |
| `team.member.remove` | Y | Y | Y | — |
| `project.create` | Y | Y | — | — |
| `project.read` | Y | Y | G | G |
| `project.update` | Y | Y | G | G |
| `project.delete` | Y | Y | — | — |
| `project.archive` | Y | Y | G | — |
| `project.unarchive` | Y | Y | G | — |
| `project.status.change` | Y | Y | G | — |
| `project.public.toggle` | Y | Y | G | — |
| `project.assign_manager` | Y | Y | — | — |
| `project.assign_team` | Y | Y | G | — |
| `project.permission.grant` | Y | Y | G | — |
| `environment.create` | Y | Y | G | G |
| `environment.read` | Y | Y | G | G |
| `environment.update` | Y | Y | G | G |
| `environment.delete` | Y | Y | G | — |
| `variable.create` | Y | Y | G | G |
| `variable.read` | Y | Y | G | G |
| `variable.update` | Y | Y | G | G |
| `variable.delete` | Y | Y | G | G |
| `variable.reveal` | Y | Y | G | G |
| `variable.bulk_import` | Y | Y | G | — |
| `variable.export` | Y | Y | G | G |
| `audit.timeline.view.org` | Y | Y | G | — |
| `audit.timeline.view.project` | Y | Y | G | G |
| `audit.timeline.view.user` | Y | Y | — | — |
| `audit.timeline.view.self` | Y | Y | Y | Y |
| `notification.list` | Y | Y | Y | Y |
| `notification.mark_read` | Y | Y | Y | Y |
| `notification.mark_unread` | Y | Y | Y | Y |
| `profile.view` | Y | Y | Y | Y |
| `profile.update` | Y | Y | Y | Y |
| `session.list` | Y | Y | Y | Y |
| `session.revoke` | Y | Y | Y | Y |
| `session.revoke_others` | Y | Y | Y | Y |
| `account.list` | Y | Y | Y | Y |
| `account.link` | Y | Y | Y | Y |
| `account.unlink` | Y | Y* | Y* | Y* |
| `account.export` | Y | Y | Y | Y |
| `account.delete` | Y | Y† | Y† | Y† |

**MANAGER “G” rows:** requires row in `project_manager` for that `project_id`.  
**MEMBER “G” rows:** requires team membership for a team linked in `project_team` **and** grant bit in `project_member_grant`.

**User-scope rows (`profile.*`, `session.*`, `account.*`, `audit.timeline.view.self`):** allowed for **any authenticated user on their own account** — matrix **OWNER / MANAGER / MEMBER** columns all **Y**; enforcement is **self-only**, not org role. No active org required.

\* **`account.unlink`:** deny if unlinking would remove the **last** login method.  
† **`account.delete`:** deny while user is **sole owner** of any org; otherwise allow after typed confirmation.

### 6.1 Default project member grant template

Managers assign grants as subsets of:

`project.read`, `environment.read`, `environment.create`, `environment.update`, `environment.delete`, `variable.read`, `variable.create`, `variable.update`, `variable.delete`, `variable.reveal`, `variable.export`

Default for new team on project: `project.read`, `environment.read`, `variable.read` (no reveal).

### 6.2 Restore actions (soft-delete reversal)

Soft-deleted entities are hidden from default queries but can be restored by authorized roles. Registry entries (high level):

| Action | OWNER | MANAGER | MEMBER |
|--------|:-----:|:-------:|:------:|
| `project.restore` | Y | G (assigned project) | — |
| `environment.restore` | Y | G | — |
| `variable.restore` | Y | G | — |
| `team.restore` | Y | Y | — |
| `organization.restore` | Y | — | — |

Each restore writes `audit_event` with `result: success` and references the prior delete event via `payload`. Hard deletes are avoided except where justified (e.g. **session revoke** remains a true delete).

---

## 7. Client: `useCan`, `<Can>`, sidebar

### 7.1 Server-first permissions snapshot

tRPC `permissions.snapshot` (org + optional project):

```ts
{
  /** Phase 1: always false; field reserved for future ADMIN */
  platformAdmin: false;
  orgRole: "owner" | "manager" | "member" | null;
  projectGrants: Record<ActionName, boolean>; // or grant keys
  blocked: ActionName[];
}
```

Cached in React Query; invalidated on org switch, project navigation, role/grant mutations. **`user`-scoped actions** (`profile.*`, `session.*`, `account.*`) evaluate from session alone — snapshot may omit `orgRole` requirement for those keys.

### 7.2 `useCan(action, { projectId? })`

- Returns `{ allowed, reason, isLoading }`  
- Client-side mirror of server rules for **UI only** — never authoritative  
- Optional: call `authClient.organization.hasPermission` for org actions when BA client suffices

### 7.3 `<Can action="variable.create" projectId={id} fallback={null}>`

Render children only when allowed; use for buttons, menu items, sheets.

### 7.4 Sidebar config

```ts
export const platformNav = [
  { href: "/dashboard", label: "Dashboard", action: null },
  { href: "/dashboard/projects", label: "Projects", action: "project.read" },
  {
    href: "/dashboard/organizations",
    label: "Organizations",
    action: "organization.list", // or organization.view — one canonical nav gate
  },
  {
    href: "/dashboard/timeline",
    label: "Timeline",
    action: "audit.timeline.view.org",
  },
  { href: "/dashboard/notifications", label: "Notifications", action: "notification.list" },
  { href: "/dashboard/settings", label: "Settings", action: "profile.view" },
] satisfies NavItem[];
```

- **Org switcher** remains at the **top of the sidebar** (unchanged); **Organizations** is a separate list/hub nav item.
- **Settings** gates on **`profile.view`** — account tabs only (no org management link).

Project sidebar (`sidebar-project-nav.ts`) adds `action: "project.read"` per project link. Hide item if `useCan` false.

**Redirects / route migration:**

| From | To |
|------|-----|
| `/dashboard/activity` | `/dashboard/timeline` (see global timeline behavior below) |
| `/dashboard/settings/organization` | `/dashboard/organizations/[slug]` (matching org) or org list |

**Global `/dashboard/timeline`:** When orgs are enabled, show **active org** feed (`audit.timeline.view.org`). If no active org, redirect to **`/dashboard/organizations/[slug]/timeline`** for a sensible default org or to the org list. **Personal** activity: **Settings → Timeline** (`audit.timeline.view.self`).

**Org `member` with no team or project:** User remains in the organization but has **no project grants** and **no org timeline rows** (`audit.timeline.view.org` denied or API returns empty). Show empty state copy: *"Contact your manager to get assigned to a team or project"* on org Timeline and on **`/dashboard/projects`** when the list is empty for that reason (distinct from “no projects in org” for owners).

---

## 8. Audit timeline & notifications

### 8.1 `audit_event` (replaces `audit_log`)

| Column | Type | Notes |
|--------|------|-------|
| `id` | text PK | |
| `action` | text | canonical name, indexed |
| `result` | text | `success` \| `failure` \| `denied` |
| `actor_user_id` | text FK | |
| `organization_id` | text FK nullable | |
| `project_id` | text FK nullable | |
| `environment_id` | text FK nullable | |
| `entity_type` | text | from registry |
| `entity_id` | text nullable | |
| `entity_slug` | text nullable | |
| `target_user_id` | text nullable | e.g. timeline viewed |
| `denial_reason` | text nullable | |
| `error_code` | text nullable | |
| `payload` | jsonb | diff/metadata; **no secret values** |
| `ip_address` | text | |
| `user_agent` | text | |
| `duration_ms` | int nullable | |
| `created_at` | timestamptz | |

Indexes: `(organization_id, created_at DESC)`, `(actor_user_id, created_at DESC)`, `(project_id, created_at DESC)`, `(action, created_at DESC)`.

**Retention:** `audit_event` rows are retained **indefinitely** (no TTL or automatic purge in Phase 1). Compliance exports and future archival jobs may add cold storage later; product default is **forever** for org and user timelines.

**Migration:** backfill from `audit_log` mapping old enums → canonical names (§9).

### 8.2 UI surfaces

#### Account settings (`/dashboard/settings`) — user scope only

| Tab / area | Route (suggested) | Action gate | Behavior |
|------------|-------------------|-------------|----------|
| **Profile** | `/dashboard/settings` | `profile.view`, `profile.update` | Name, avatar, email |
| **Sessions** | `/dashboard/settings/sessions` | `session.list`, `session.revoke`, `session.revoke_others` | Devices: IP, UA, last active, current-session badge |
| **Connected accounts** | `/dashboard/settings/accounts` | `account.list`, `account.link`, `account.unlink` | GitHub: provider, account id, scopes, linked date; prevent unlink of last login method |
| **Export my data** | `/dashboard/settings/export` | `account.export` | JSON download (sync OK) |
| **Delete account** | `/dashboard/settings/delete` | `account.delete` | Typed confirmation; block or require transfer if sole org owner |
| **Timeline** | `/dashboard/settings/timeline` | `audit.timeline.view.self` | Own rows from `audit_event` |

**Remove** org management from this surface (`/dashboard/settings/organization` → Organizations module).

#### Organizations module

| Surface | Action gate | Data / notes |
|---------|-------------|--------------|
| `/dashboard/organizations` | `organization.list` | Grid/list, stats, filters (Projects-like) |
| `/dashboard/organizations/[slug]` | `organization.hub.view` | Hub overview; cards → child sections |
| `.../members` | `member.list`, `member.*` | Members |
| `.../teams` | `team.*` | Teams |
| `.../invitations` | `invitation.*` | Invitations |
| `.../roles` | `member.role.update`, org AC | Roles & access |
| `.../settings` | `organization.settings.*`, `organization.update`, `organization.delete`, `organization.transfer_ownership` | Settings; danger zone |
| `.../timeline` | `audit.timeline.view.org` | Org-scoped `audit_event` feed |

#### Timeline (org + cross-user)

| Surface | Action gate | Data |
|---------|-------------|------|
| `/dashboard/timeline` | `audit.timeline.view.org` | Active-org feed (redirect rules §7.4); MANAGER project filter |
| Org hub → Timeline | `audit.timeline.view.org` | Feed for hub `slug` |
| Settings → Timeline | `audit.timeline.view.self` | Actor = self |
| Org → view member (OWNER+) | `audit.timeline.view.user` | `targetUserId` param |

Reuses list component; filters by action, result, project, actor.

### 8.3 Notifications hook-in

| Step | Behavior |
|------|----------|
| Registry | `notifyOn: ['invitation.received']` on `member.invite` |
| On `audit_event` insert | If `result === 'success'` && action has `notifyOn`, call existing `notify()` with idempotency `audit:{audit_event.id}` |
| Future | `variable.updated` etc. |

Keeps notification types in `@loftlancer/notifications`; registry only references type names.

---

## 9. Proposed migration tables (`0006_actions_permissions_audit`)

Joins **same approval bundle** as `0005` (user approves one prod cut) or immediately follows `0005` in journal — **single prod window**.

### 9.1 Auth / platform — **deferred (not Phase 1)**

Do **not** add Better Auth admin plugin columns or enable `admin()` in Phase 1. When platform admin ships, add `user.role`, ban fields, and plugin config in a separate migration (`0007_platform_admin` or similar).

### 9.2 Better Auth teams (organization plugin) — **Phase 1**

Use Better Auth’s generated team / team_member schema when enabling teams (run `db:generate` after plugin config) — typically:

- `team` (id, name, organization_id, …)  
- `team_member` (team_id, user_id, …)

### 9.3 App project access

```sql
CREATE TABLE project_manager (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  UNIQUE (project_id, user_id)
);

CREATE TABLE project_team (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  team_id text NOT NULL REFERENCES team(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  UNIQUE (project_id, team_id)
);

CREATE TABLE project_member_grant (
  id text PRIMARY KEY,
  organization_id text NOT NULL REFERENCES organization(id) ON DELETE CASCADE,
  project_id text NOT NULL REFERENCES project(id) ON DELETE CASCADE,
  user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  grants text[] NOT NULL DEFAULT '{}', -- canonical action names or grant keys
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by text REFERENCES "user"(id) ON DELETE SET NULL,
  UNIQUE (project_id, user_id)
);

CREATE INDEX project_manager_user_idx ON project_manager (user_id);
CREATE INDEX project_member_grant_user_idx ON project_member_grant (user_id);
```

### 9.4 Action block list

```sql
CREATE TABLE action_block (
  id text PRIMARY KEY,
  action text NOT NULL, -- canonical name or '*' for all
  scope_type text NOT NULL, -- platform | organization | project | user
  scope_id text, -- null for platform-wide
  reason text,
  created_by text REFERENCES "user"(id) ON DELETE SET NULL,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX action_block_scope_idx ON action_block (scope_type, scope_id);
CREATE INDEX action_block_action_idx ON action_block (action);
```

### 9.5 Audit event + deprecate audit_log

```sql
CREATE TABLE audit_event (
  id text PRIMARY KEY,
  action text NOT NULL,
  result text NOT NULL,
  actor_user_id text NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  organization_id text REFERENCES organization(id) ON DELETE SET NULL,
  project_id text REFERENCES project(id) ON DELETE SET NULL,
  environment_id text REFERENCES environment(id) ON DELETE SET NULL,
  entity_type text NOT NULL,
  entity_id text,
  entity_slug text,
  target_user_id text REFERENCES "user"(id) ON DELETE SET NULL,
  denial_reason text,
  error_code text,
  payload jsonb NOT NULL DEFAULT '{}',
  ip_address text,
  user_agent text,
  duration_ms integer,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- indexes as §8.1

-- After backfill:
-- ALTER TABLE audit_log RENAME TO audit_log_legacy;
```

### 9.6 Data migration rules

| Data | Rule |
|------|------|
| `member.role = 'admin'` | Update to `'manager'` |
| `member.role = 'owner'` | Unchanged (OWNER) |
| Projects with `organization_id` set | OWNER = org owners; **no** `project_manager` rows initially |
| Projects without manager | **OWNER** manages all; MANAGER sees nothing until assigned |
| `project.user_id` | Remains creator attribution; access not limited to creator after org attach |
| `audit_log` rows | Map `CREATE`+`PROJECT` → `project.create`, etc.; `result = 'success'` |
| Platform admins | **Deferred** — no `user.role` seed in Phase 1 |

### 9.7 User data export (Phase 1)

**Confirmed:** `account.export` returns a **synchronous JSON** download assembled from user-owned tables. **No** `user_data_export_job` table in Phase 1 (defer async/blob export to a later phase if needed).

### 9.8 Soft deletes (app-wide)

Apply **`deleted_at`** (`timestamptz`, nullable) and **`deleted_by`** (`text` FK → `user`, nullable) on:

- `project`, `environment`, `environment_variable`
- `team`, project access rows (`project_manager`, `project_team`, `project_member_grant`)
- `notification`
- `organization` (org delete = soft delete + anonymize/sign-out flow for members; audit rows keep stable references)

**Query rules:** default Drizzle helpers / shared filter exclude rows where `deleted_at IS NOT NULL`. Partial unique indexes use `WHERE deleted_at IS NULL` so slugs and natural keys can be reused only after hard purge (not Phase 1).

**Delete behavior:** user-facing deletes call registry `*.delete` actions → set `deleted_at` / `deleted_by`, emit `audit_event`; **`account.delete`** = soft delete user row + anonymize PII + revoke sessions (audit retains actor/target ids as today).

**Restore:** `*.restore` actions (§6.2) clear `deleted_at` / `deleted_by` with audit. **OWNER** org-wide; **MANAGER** on assigned projects for project/env/variable restore.

**Hard delete:** only where justified (session revoke, idempotent cleanup jobs); document in registry `audit.severity`.

### 9.9 Route redirects (app config)

Document in migration notes / Next redirects:

- `/dashboard/settings/organization` → `/dashboard/organizations/[slug]` or `/dashboard/organizations`
- `/dashboard/activity` → `/dashboard/timeline` (or org hub timeline per §7.4)

### 9.10 Feature flags

```env
ACTIONS_AUDIT_ENABLED=true
NEXT_PUBLIC_ACTIONS_AUDIT_ENABLED=true
```

Gate registry, `requireAction`, and Timeline UI until migration applied.

---

## 10. Workstreams (parallel agents)

| ID | Workstream | Owns (paths) | Depends on |
|----|------------|--------------|------------|
| **W1** | Action registry package | `packages/actions/**` | — |
| **W2** | DB schema + SQL `0006` | `packages/db/src/schema/*`, `migrations/0006_*`, `docs/ACTIONS_*` | W1 action list frozen |
| **W3** | `requireAction` + audit writer | `packages/api/src/actions/**`, retrofit routers | W1, W2 |
| **W4** | Better Auth config | `packages/auth/**`, team enablement, org role migrate (`admin`→`manager`) — **no admin plugin** | W1, W2 |
| **W4b** | Platform admin (later) | admin plugin, `platform.*` wiring, operator UI | Post–Phase 1 |
| **W5** | Timeline UI | `apps/web/.../timeline/**`, remove/replace `activity/**`, account settings timeline tab, org hub timeline | W3 list API, **W9** (settings shell), **W10** (org hub routes) |
| **W6** | Client `useCan` + sidebar | `apps/web/src/lib/nav/**`, `components/app-sidebar.tsx`, Organizations nav + timeline redirect behavior | W3 snapshot endpoint, **W10** (`organization.list` gate) |
| **W7** | Notifications bridge | `packages/notifications/**`, registry `notifyOn` | W3 audit insert hook |
| **W8** | E2E + backfill scripts | `apps/web/e2e/**`, `packages/db/scripts/**` | W3–W7, W9, W10 |
| **W9** | Account settings UI + BA wrappers | `apps/web/.../settings/**`, `packages/auth/**` hooks for sessions/accounts/delete/export | W1 (`user` scope actions), W3 |
| **W10** | Organizations module UI + route migration | `apps/web/.../organizations/**`, remove `settings/organization`, redirects | W1, W4, W6 |

**Suggested order:** W1 → (W2 ∥ W4) → W3 → (W9 ∥ W10) → (W5 ∥ W6 ∥ W7) → W8.

**Production rollout:** ship **one combined SQL migration** for prod (**`0005_platform_variables_and_notifications`** already bundled variables v2 + notifications; **`0006_actions_permissions_audit`** adds registry tables, soft deletes, `audit_event`, teams, etc.). Enable feature flags in a **single** approval step after the combined migration is applied (align flags with `docs/PLATFORM_MIGRATION_0005.md` + forthcoming `0006` notes).

---

## 11. Open questions (for confirmation)

| # | Question | Status |
|---|----------|--------|
| 1 | **Account settings scope** — `/dashboard/settings` is account-only; org UI moves to Organizations module | **Resolved** |
| 2 | **User action scope** — `profile.*`, `session.*`, `account.*`; `requireAction` without active org | **Resolved** |
| 3 | **Organizations module** — list + `[slug]` hub sections, sidebar nav, settings org route migration | **Resolved** |
| 4 | **Global `/dashboard/timeline`** — redirect to active org or org hub timeline | **Resolved** |
| 5 | **Org `member` with no team/project:** Org timeline and empty **Projects** for that user show nothing; empty copy *"Contact your manager to get assigned to a team or project"* | **Resolved** |
| 6 | **MANAGER invite:** Managers **can** invite to org (`member.invite` = Y) and use `team.member.add`; owners retain `member.role.update` / `member.remove` | **Resolved** |
| 7 | **Audit timeline retention:** `audit_event` retained **forever** (no automatic purge in Phase 1) | **Resolved** |
| 8 | **Block list precedence (future):** When ADMIN exists, should platform block override ADMIN? (Recommended: yes for compliance.) | Open (future ADMIN phase) |
| 9 | **0005 + 0006:** One prod migration train + feature flags + single user approval | **Resolved** — one combined prod migration bundle; flags off until approved |
| 10 | **`account.export`:** Sync JSON only; no `user_data_export_job` table in Phase 1 | **Resolved** |
| 11 | **Soft deletes app-wide** — `deleted_at` / `deleted_by`, restore actions, default query filter | **Resolved** (see §9.8, §6.2) |

---

## 12. References

- In-repo: `packages/api/src/audit.ts`, `packages/api/src/org-access.ts`, `packages/db/src/schema/audit.ts`  
- Better Auth: `plugins/organization/access/statement.mjs`, `plugins/organization/has-permission.mjs`, `plugins/admin/*`  
- Related: `docs/PLATFORM_MIGRATION_0005.md`, `docs/ORGANIZATION_MIGRATION.md`
