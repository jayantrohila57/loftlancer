# Management architecture contract

This document defines the resource boundaries used by the Studio UI, route builder,
and API. Application-scoped membership is not implemented. Teams use scoped
`lead` and `member` roles for team roster operations.

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
| Application member/role assignment | Application | Not available until app-scoped schema and server enforcement ship |
| Account profile, sessions, connected accounts, account deletion | Account | Current user only |

An owner is the accountable organization principal; a member is a person with
organization membership; a role is a named capability set; a grant is an
explicit resource capability; a team link is a relationship that may provide
project access. These terms must not be used interchangeably.

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
| Application access | Must be independently assignable and enforced at app scope. Until an app membership/grant schema and server guard exist, installed applications inherit the existing project gate; the UI must not imply a narrower app ACL. |
| Action block | Explicit deny wins over every role, ownership, team, project, or app grant. Revoking a membership or relationship removes that access path immediately; other valid paths may continue to grant access. |

Ownership transfer is already transactional: it locks the active organization and
members, validates the target, promotes the target and demotes the prior owner.
Member/team/project grant revocation must invalidate permission snapshots and
deny subsequent server requests. For a future schema migration, preserve current
effective access by backfilling equivalent grants before enabling the new gate;
rollback disables the new gate before reverting the schema, and must not delete
pre-existing membership or access rows. App-level grants should default to no
additional access until explicitly assigned.

Direct `project_member_grant` rows alone do **not** confer member access under
the current evaluator: the actor must also have a team linked to that project.
This preserves the currently enforced access boundary until an explicit policy
and migration review changes it. Team member/lead role and app-level grant rows
are not project capabilities. Team roles are persisted and checked by server
actions and permission snapshots. App-level grant rows are not implemented.

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
sidebar links, email links and app manifests should use the route builder. New
access models require schema migration, server guards, snapshot parity, visible
source-of-access explanations, revoke behavior and a rollback plan before UI
exposure. Preserve existing grants during migration; never infer app membership
from project membership once app-scoped access is introduced.
