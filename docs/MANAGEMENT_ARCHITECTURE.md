# Management architecture contract

This document defines the resource boundaries used by the Studio UI, route builder,
and API. Applications support inherited project access or restricted direct-user
and linked-team assignments. Teams use scoped `lead` and `member` roles for team
roster operations.

## Resource tree and canonical routes

```text
Studio
└── Organization /:org
    ├── members, invitations, roles, security, settings
    ├── teams /teams/:teamId
    │   ├── members, invitations, settings
    │   └── projects (links to projects; does not own project configuration)
    └── projects /:project
        ├── access, invitations, activity, settings
        └── installed applications /apps/:app
            ├── app settings
            ├── Environments /apps/env/:envSlug
            └── Tasks /apps/tasks/:number
```

The canonical path builders are in `packages/ui/src/lib/studio-routes.ts`.
Environments and Tasks are installed project applications, so their canonical
routes are nested under `/apps`. Existing sibling `/env`, `/env/:envSlug`,
`/tasks`, and `/tasks/:number` links redirect to the canonical route.
The Apps page is the project-scoped catalog: installed apps, available apps,
and recently uninstalled apps with retained data are shown separately. The
registry supplies installable apps; users do not create arbitrary app records.
App pages and settings require an active install. Uninstall retains app data
for 30 days; reinstall during that window restores it, and expired data is
purged before the app returns to the available catalog.

## Operation ownership

| Operation | Owner | Scope |
| --- | --- | --- |
| Organization profile, settings, security, org roles | Organization | One organization |
| Organization member lifecycle and organization invitations | Organization | Org membership and org role |
| Project create, configure, archive, restore, delete | Organization (create/list), Project (after creation) | One project |
| Project direct grants, project managers, team links, project invitations | Project | One project in its organization |
| Team create, team profile, team lifecycle, team role and membership | Organization (create/list), Team (after creation) | One team in its organization |
| Team-to-project assignment | Team initiates; Project authorizes and stores the link | Both resource IDs must share an organization |
| Application install/uninstall, configuration and lifecycle | Project owns install; Application owns its settings | One installed app in a project |
| Application member/team assignment and access mode | Application | One installed app, within project permissions |
| Account profile, sessions, connected accounts, account deletion | Account | Current user only |

An owner is the accountable organization principal; a member is a person with
organization membership; a role is a named capability set; a grant is an
explicit resource capability; a team link is a relationship that may provide
project access. These terms must not be used interchangeably.

### Organization identity and profile

`organization` remains the Better Auth identity source for `id`, `name`,
`slug`, `logo`, and existing metadata markers. It also owns lifecycle dates and
creator/updater attribution. Lifecycle is derived from timestamps: active has
no `archived_at` or `deleted_at`; archived has `archived_at`; deleted remains
the existing soft-delete state. Archive is reversible and preserves members,
projects, teams, apps, and their data. Archived organizations stay visible to
their members; owners can restore them. Shared server action evaluation and
Better Auth hooks deny writes while archived, with restoration as the allowed
recovery operation.

Optional company and contact values live in the one-to-one `organization_profile`
table. Public identity is limited to description, website, industry, and size.
Legal name, contact channels, and postal address are owner-only in settings and
are excluded from public/profile read models. Omitted patch keys preserve data;
explicit `null` clears a value. Country codes use two-letter uppercase ISO
codes, size values use `1-10`, `11-50`, `51-200`, `201-1000`, or `1001+`, and
URLs allow only HTTP(S). Name, slug, and logo are not duplicated in this table.
Existing organizations need no profile row or mandatory field values.

## Effective access policy (current behavior)

The complete per-action registry scope, eligible org roles, required grant, and
denial reasons are listed in [`MANAGEMENT_ACTION_MATRIX.md`](./MANAGEMENT_ACTION_MATRIX.md).

| Actor | Organization action | Project action | Current access path |
| --- | --- | --- | --- |
| Organization owner | Allowed | Allowed | Organization ownership |
| Organization manager | Role-gated | Allowed only when project manager or creator | Organization role plus project assignment |
| Organization member | Role-gated | Requires linked team **and** matching project member grant | Active org membership, team-to-project link and explicit grant |
| Team lead | May view and manage membership for their team | Same as their organization role and project grants | Team role grants no project or organization settings access |
| Non-member / cross-org identity | Denied | Denied | No organization membership |
| Any actor against a blocked action | Denied | Denied | Action block takes precedence in server guard |

## Access model decisions for future scoped grants

| Relationship | Meaning and effective access |
| --- | --- |
| Owner | Organization accountability and complete access; ownership transfer must leave one active owner. |
| Organization membership | Establishes tenant membership only; it does not imply access to every project. |
| Manager role | Organization operations plus project actions only for an explicit manager assignment or creator attribution, as the registry specifies. |
| Team lead / team member | A team lead can view, add and remove members of that team. Only organization owners/managers can change team roles, team settings, invitations or project links. The team role itself does not grant project access. |
| Direct project grant | A capability grant; under the current policy it is effective only with a linked-team path. Direct grant alone is explicitly denied (`no_team_on_project`). |
| Application access | Existing installs default to inherited project access. Restricted mode allows only project-authorized users with a direct app grant or membership in an assigned team linked to the same project. Organization owners/managers and project creators/managers retain access. App grants never add project capabilities. |
| Action block | Explicit deny wins over every role, ownership, team, project, or app grant. Revoking a membership or relationship removes that access path immediately; other valid paths may continue to grant access. |

Ownership transfer is already transactional: it locks the active organization and
members, validates the target, promotes the target and demotes the prior owner.
Member/team/project grant revocation must invalidate permission snapshots and
deny subsequent server requests. Application installs retain inherited access by
default; switching an app to restricted mode is explicit and warns that unassigned
users lose access. A user or team assignment is evaluated only after the same
project action permission succeeds. Removing project access or a team-to-project
link removes effective app access immediately. To roll back the app-access
migration, restore restricted apps to inherited mode first and retain assignment
rows until the rollback is accepted.

Direct `project_member_grant` rows alone do **not** confer member access under
the current evaluator: the actor must also have a team linked to that project.
This preserves the currently enforced access boundary. Team member/lead role and
app-level grant rows are not project capabilities. Team roles are persisted and
checked by server actions and permission snapshots. App-specific assignments are
stored in `project_app_access`; `project_app.access_mode` records whether that
app inherits project access or restricts it to selected assignments. Server
guards and permission snapshots use the same effective app-access rule.

## Navigation and page interaction contract

Use the shared Studio shell header for sidebar control and breadcrumb context.
The resource subheader contains the resource identity and sibling destinations;
it does not own page-specific actions. The selected page owns its actions,
filters, and forms. Use one navigation row only. Organize page content into
sections with shared `AccordionSection` where disclosure is needed. Do not add
summary-stat cards or nested tab rows. Tables and mutations use shared UI
patterns and server authorization remains authoritative.

## Compatibility and migration

Keep deep links working with redirects to canonical app routes. URL generators,
sidebar links, email links and app manifests should use the route builder. App
access changes use a reviewed schema migration, server guards, permission snapshot
parity, visible source-of-access explanations, immediate revoke behavior and a
rollback plan. Existing app access remains inherited until a manager explicitly
restricts it; a direct or team assignment never bypasses project permissions.


## Release verification matrix

| Area | Canonical route family | Verify as owner/manager | Verify as project member | Verify after access removal |
| --- | --- | --- | --- | --- |
| Organization | `/studio/:org/{members,invitations,roles,settings}` | Manage org membership, invitations, roles, and settings | View only allowed org data; denied mutations stay denied | Removed member loses org routes and API access |
| Project | `/studio/:org/:project/{access,invitations,activity,settings}` | Create/configure, assign access, invite, and archive/restore | Only assigned project data and permitted actions appear | Revoke project paths and confirm server denial |
| Team | `/studio/:org/teams/:teamId/{members,invitations,settings}` | Manage roster, roles, links, and settings | Team lead can manage own roster; member cannot change team settings | Removed team membership cannot grant linked project or app access |
| Application | `/studio/:org/:project/apps/{env,tasks}` and `/studio/:org/:project/apps/:app/settings` | Install/configure/restrict and assign users or linked teams | App access remains within project permissions | Revoke direct/team/project path and confirm app actions are denied |

For every route, check the shared shell header and breadcrumb, one resource subheader/navigation row, page-owned actions below navigation, section-based content, matching loading skeleton, empty/error/denied state, table search and pagination, keyboard focus and labels, and narrow viewport layout. Do not use nested tabs or dashboard statistics. Exercise create, edit, view, delete/archive, restore, invitation, grant, and revoke flows where supported.

Authorization regressions are covered by API unit tests and CI; UI route and responsive checks require a signed-in human review on each release. A successful CI build does not substitute for that visual review.
