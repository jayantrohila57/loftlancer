# Studio route and data-flow matrix

This matrix records the current route contract for the dashboard hierarchy work (#491–#500). Route groups use the public `/studio` prefix; the source paths omit it because Studio is mounted at that base path. A route's layout guards scope access before rendering its page. Route-specific server guards, metadata, and hydration are called out where present.

## Scope frames

| Scope | Route layout | Responsibility | Data bootstrap |
| --- | --- | --- | --- |
| Authenticated Studio | `apps/studio/src/app/(private)/(shell)/layout.tsx` | `PrivateDashboardShell`, personal/global navigation, auth guard, request-path org hint | `dehydrateStudioShellQueries(session, { urlOrgSlug })`; shell queries hydrate through TanStack Query |
| Organization | `apps/studio/src/app/(private)/(shell)/[org]/layout.tsx` | Reserved-slug check, membership guard, subtree preflight, `OrganizationLayoutShell` | URL org is synchronized by `proxy.ts`; shell and domain hooks read hydrated org queries |
| Project | `apps/studio/src/app/(private)/(shell)/[org]/[project]/layout.tsx` | Project access guard and `ProjectLayoutShell` | project page guards hydrate project queries; app/task/environment hooks use project-scoped tRPC queries |
| Support | `apps/studio/src/app/(private)/(shell)/support/layout.tsx` | `SupportFrame`, Tickets/Help sibling navigation, and route-aware Back parent | ticket list and detail guards run in nested layouts; help articles use the FAQ query |
| Personal account | `apps/auth/src/app/(account)/settings/layout.tsx` | Separate Auth app account settings frame and auth state | Auth/session queries; no organization mutation scope |
| Public invitation | `apps/studio/src/app/(public)/invite/[invitationId]/page.tsx` | Invitation acceptance without requiring membership first | Server invitation lookup and acceptance flow |

## Route matrix

| Destination | Page / domain surface | Main data and action path | Parent / return |
| --- | --- | --- | --- |
| `/studio` | Home / organization directory and incoming invitations | Organization directory hooks and invitation queries | Personal Studio home |
| `/studio/new` | Organization create flow | Organization create mutation, guarded by canonical organization action | `/studio` |
| `/studio/notifications` | Notification feed and unread filter | `useNotificationsList`, `useNotificationsUnreadCount`, notification read mutations; typed destinations from `@loftlancer/notifications` | `/studio` |
| `/studio/activity` | Personal activity | `TimelinePageClient` / audit queries, based on audit feature flag | `/studio` |
| `/studio/support` | Redirects to Tickets | `routes.supportTickets()` | `/studio` |
| `/studio/support/tickets` | Ticket directory | Ticket queries, search/table rows; New ticket belongs to this page | Support frame Back to `/studio` |
| `/studio/support/tickets/new` | New ticket | Ticket create mutation | Support frame Back to `/studio/support/tickets` |
| `/studio/support/tickets/:ticketId` | Ticket detail and replies | Ticket detail query and reply mutation | Support frame Back to `/studio/support/tickets` |
| `/studio/support/help` | Help directory | Help article queries/search; empty results link to ticket creation | Support frame Back to `/studio` |
| `/studio/support/help/:slug` | Help article | Article lookup by slug; unknown article shows an explanation | Support frame Back to `/studio/support/help` |
| Auth app `/settings` and `/settings/:section` | Account settings index and Profile, Security, Sessions, Connected accounts, Notifications, My activity, Danger zone | Better Auth/session and account-specific actions | Section Back returns to Account settings; its root Back returns to Studio |
| `/studio/:org` | Organization overview | Organization detail query and org-scoped summary hooks | `/studio` organization directory |
| `/studio/:org/projects` | Organization project directory | Project list/search/filter hooks and project create sheet | `/studio/:org` |
| `/studio/:org/projects/new` | Project create route | Project create workflow; same project-list scope | `/studio/:org/projects` |
| `/studio/:org/members` | Organization members | Member list, role/access queries and member mutations | `/studio/:org` People area |
| `/studio/:org/invitations` | Organization invitations | Invitation list/create/resend/revoke hooks | `/studio/:org` People area |
| `/studio/:org/teams` | Organization teams | Team list and create action; detail pages own editing and deletion | `/studio/:org` People area |
| `/studio/:org/teams/:teamId` | Team overview | Team members and linked-project summaries | `/studio/:org/teams` |
| `/studio/:org/teams/:teamId/members` | Team members | `teams.members`, `organizations.listMembers`, add/remove mutations | Team overview |
| `/studio/:org/teams/:teamId/projects` | Team project links | `teams.projects` and permission-filtered `teams.linkableProjects`; `projectAccess.assignTeam/removeTeam` | Team overview |
| `/studio/:org/teams/:teamId/invitations` | Team invitations | Better Auth invitation with `teamId`, scoped list, resend/revoke | Team overview |
| `/studio/:org/teams/:teamId/settings` | Team identity and lifecycle | `teams.update/delete` | Team overview |
| `/studio/:org/roles` | Organization roles and access explanation | Role/permission metadata and org scope | `/studio/:org` People area |
| `/studio/:org/activity` | Organization activity | `TimelinePageClient` / audit queries with org scope | `/studio/:org` |
| `/studio/:org/settings` | Organization identity and lifecycle (Organization settings) | Organization detail/update hooks and canonical permission gates | `/studio/:org` |
| `/studio/:org/:project` | Project overview, status and access summary | Project detail/access queries; links to installed app destinations | `/studio/:org/projects` |
| `/studio/:org/:project/settings` | Project identity and lifecycle settings (Project settings) | Project update hooks; canonical server permission checks | `/studio/:org/:project` |
| `/studio/:org/:project/access` | Project access | Managers, linked teams, and direct grants via `projectAccess` | Project overview |
| `/studio/:org/:project/invitations` | Project invitations | Scoped invitation with status filter and server pagination; acceptance joins the organization if needed and adds default project read grants | Project overview |
| `/studio/:org/:project/activity` | Project activity | `auditEvents.list` with project scope, fixed project ID, and project timeline permission | Project overview |
| `/studio/:org/:project/apps` | App directory and install management | `useProjectApps`; install/uninstall/configure mutations and invalidation | `/studio/:org/:project` |
| `/studio/:org/:project/apps/:app` | Installed app work surface | `AppGate` → app-specific domain hook/API; Environments and Tasks use static app routes | `/studio/:org/:project/apps` or the app's parent item list |
| `/studio/:org/:project/apps/:app/settings` | Installed app configuration | `AppGate` → `AppSettingsPage` → `useProjectApps` and `projectApps.configure`; Tasks and Environments settings are static routes below | app work surface; uninstalled-app action returns to Apps when manageable |
| `/studio/:org/:project/apps/env` | Environments list and selected environment | `useEnvironments`, `useEnvironmentVariableCounts`; environment tabs are URL links | Project Apps / Environments |
| `/studio/:org/:project/apps/env/:envSlug` | Environment variables for one target | Project environment detail query and variable CRUD hooks | `/studio/:org/:project/apps/env` |
| `/studio/:org/:project/apps/env/settings` | Environments app settings | Static `AppSettingsPage` route for `env` | `/studio/:org/:project/apps/env` |
| `/studio/:org/:project/apps/tasks` | Task list, filters and create action | `TasksPage` task list/people/permission hooks; task create mutation | Project Apps / Tasks |
| `/studio/:org/:project/apps/tasks/:taskNumber` | Task detail (direct URLs open the task sheet) | `tasks.get`, task update/comment/delete mutations; unavailable task now offers retry or a task-list explanation | `/studio/:org/:project/apps/tasks` |
| `/studio/:org/:project/apps/tasks/settings` | Tasks app settings | Static `AppSettingsPage` route for `tasks` | `/studio/:org/:project/apps/tasks` |
| `/studio/invite/:invitationId` | Invitation acceptance | Public invitation lookup/accept route, linked from invitation notifications | `/studio` or organization overview after acceptance |

## Navigation owner, selected location, and state contracts

Each destination above inherits one of these route-family contracts. The destination table supplies the individual page, actions/data path, and parent; this table records the persistent frame, selected navigation owner, and shared failure behavior.

| Route family | Persistent frame and selected location | Page-owned actions and permission gate | Loading / empty / error / success behavior |
| --- | --- | --- | --- |
| `/studio`, `/studio/new`, `/studio/notifications`, `/studio/activity` | `PrivateDashboardShell`; Studio sidebar item is selected | Directory/create, notification filters/read actions, and activity filters are owned by their selected page; server page guards and `useCan` match the relevant action | Directory and timeline use loading/error/empty states; notifications has All/Unread, retry, empty and populated states |
| `/studio/:org` and organization sections | `OrganizationLayoutShell`; one Overview, People, Projects, Activity, or Organization settings location is active | Members/invites/team/project/settings actions stay in their page body and use organization action guards | Organization identity has a loading/not-found state; list pages expose local empty/error/retry; mutations use scoped permission gates and confirmations |
| `/studio/:org/teams/:teamId/*` | `OrganizationIdentityProvider` keeps org scope; org frame is suppressed and `TeamLayoutShell` owns the single team frame and selected Overview/Members/Projects/Invitations/Team settings location | Team member, project-link, invitation, and settings actions stay below team navigation; guarded by team/org permissions | Team shell has pending/error/not-found states; member/project/invitation pages own local loading/empty/error states |
| `/studio/:org/:project` and project sections | `ProjectLayoutShell`; one Overview, Apps, Access, Invitations, Project activity, or Project settings location is active | Project mutations and list actions remain in each page; route guards and project-scoped `useCan` checks use canonical permissions | Project identity is server-prefetched; child pages show local skeleton, empty, error/retry, and success states |
| `/studio/:org/:project/apps/*`, legacy `/env/*` and `/tasks/*` | Project frame keeps Apps selected; app or item selection is represented by the URL | App install/settings, environment selection/variables, and task filters/create/detail actions belong to the app page; app access checks installed state and project permissions | App list/query failures have retry; empty app catalog has an empty state; gated routes distinguish query failure from not-installed; item pages explain unavailable targets |
| `/studio/support/*` | `PrivateDashboardShell` plus one `SupportFrame`; Tickets or Help stays selected through nested routes | Ticket create/reply/status, help search, and page links stay in ticket/help content; nested layouts guard ticket list/create/detail | Ticket/help routes show their own loading/empty/error states; empty help results offer ticket creation; frame Back follows list/article parent |
| Auth `/settings/*` | `AccountDashboardShell` plus `AccountSettingsFrame`; Account settings section is selected | Account profile/security/session/connected-account/notification/activity/danger-zone actions stay in each account section and use account actions | Session and account queries have loading/error states; account root Back returns to Studio and section Back returns to Account settings |
| `/studio/invite/:invitationId` | Public invitation surface, no private resource frame | Accept/decline controls are owned by the invitation page; invitation access/accept guards apply | Pending, accepted, expired, revoked, missing, and wrong-account states are explicitly rendered |

## Route precedence and navigation rules

- The sidebar separates Studio-wide destinations from the active organization's Overview and Activity, organization team shortcuts, and project directory. Project apps remain nested beneath the selected project; the Apps tab opens the directory, while an installed app link opens its work surface. The project directory's `All projects` link remains visible beside the bounded project list. Favorites are shortcuts and do not claim the selected navigation state, so one canonical sidebar location stays active.
- Static `apps/env` and `apps/tasks` routes take precedence over the generic app segment. Legacy `/env` and `/tasks` deep links remain reachable. In particular, `/env/settings` and `/tasks/settings` are app settings routes, not environment/task items.
- `/apps/tasks/:taskNumber` validates a positive integer on the server and renders the task list with the matching task detail sheet open. The sheet closes to the task list; its error state covers removed or inaccessible tasks.
- `/apps/env/:envSlug` is a real destination. Tabs use links so refresh, copy-link, and modified-click behavior preserve the selected environment.
- Generic app IDs that do not resolve to a known app return not found; known but uninstalled apps show an install/access explanation. Only project managers can navigate onward to Apps to install.
- Organization routes are URL-scoped; the org layout guards membership and synchronizes the active org. The shell hides project links until org context is resolved.
- Team shortcuts use `/teams/:teamId`; the legacy `?team=` form redirects to the team detail URL.
- Breadcrumbs represent the scope chain. Back controls are omitted when they repeat a sibling/tab action; project-level and app-level parents are resolved by `ProjectLayoutShell`.
- The project frame resolves its Back target through `getProjectFrameBackTarget`; tests cover project root, Apps, Environment/Task list and detail routes, app settings, project access, and the legacy Tasks URL. Account settings breadcrumbs start at Account settings, section Back returns there, and the account index returns to Studio. Support keeps Tickets/Help navigation in one frame and resolves Back to the current section's parent.
- Notification destinations are event-specific: task events use the organization relation for legacy rows, accepted invitations open the organization's Members page, received invitations open acceptance, and ticket replies open ticket detail. Unknown, malformed, or unresolved notifications have no self-link. Activity navigation labels distinguish My activity, Organization activity, and Project activity. Authenticated target-access behavior still needs a live role-based walkthrough.

## Data-flow findings and verification

The normal path is server route guard/metadata → hydrated scope shell → domain client surface → React Query/tRPC hook → server router/action with canonical permission checks. Project layouts now hydrate the request-cached project detail query before rendering the shared project shell and page. Organization layouts pass the membership-guarded id, slug, and name into an identity context consumed by the shell and organization pages; the client auth query still fills logo and counts. Organization switching removes queries by explicit router/custom-key namespace instead of substring-matching serialized keys. Several page surfaces still invoke their own project/org hooks, so data ownership is not yet fully centralized. Do not infer that every route has one server-prefetched query or a single shared permission object.

| Check | Current state |
| --- | --- |
| Route inventory and parent destinations | Recorded above; source review completed for all Studio route families, including account/support and dynamic app/item routes; #500 final pass verifies the new Support frame and scoped settings labels |
| Type, route-literal, and production build checks | Package/app typechecks, Studio route check, and production builds passed on the #499 integration branch; repeat on the final #500 branch |
| Browser verification of loading, empty, error, and success states | Still requires an authenticated browser session and configured test data; the available in-app tab timed out while reading its authenticated DOM, and production read-through did not expose current branch code |
| Desktop/narrow viewport and keyboard review | Requires an authenticated browser pass over fixture routes; source accessibility semantics reviewed where present |
| Owner/Manager/Member/no-access comparison | Permission guards are source-reviewed; each live role scenario needs matching seeded fixture accounts |
| Five-person task-based usability study | Not performed; recruit five representative participants and attach task completion, misclick, and time-to-target findings before closing #491/#500 |

### Validation follow-up

- Shared project detail hydration with the project shell and seeded organization identity across the shell/pages.
- Organization-switch cache cleanup now matches exact tRPC router namespaces and known organization-specific custom keys; global support and preference caches are retained.
- Authenticated role/viewport/keyboard walkthroughs and the five-person study remain outstanding. Do not report either as completed from source review or an agent walkthrough.

### Human walkthrough tasks

1. Find an organization, invite a person, and check invitation status.
2. Find a team, add a member, and explain which projects the team can access.
3. Create a project and explain who can see it.
4. Open Apps, configure Environments, and navigate to a production environment.
5. Create a task, open its detail from a notification, and return to Tasks.

Record completion without hints, wrong turns, dead ends, time to target, and participants' own explanation of each scope. Do not count a source review or an agent walkthrough as user-study evidence.

## Scoped management update (#507)

Organization invitations are limited to organization scope; team invitations carry `team_id`; project invitations carry `project_id`. A project invitation is accepted through the transactional API path, which creates organization membership when needed and grants project read access. The Better Auth organization acceptance endpoint rejects project-scoped invitations to prevent bypassing the grant. Team-to-project linking is available from both team Projects and project Access. Canonical app URLs are below `/apps`; legacy app URLs remain reachable during migration. The project invitation column requires `packages/db/src/migrations/0019_project_scoped_invitations.sql` before deploying the code. Authenticated Owner/Manager/Member browser validation and the five-person study in #500 are still required.

Team-to-project linking currently materializes default grants in each member's project grant row. Unlinking a team or deleting it removes the association but does not revoke those member grants. Project Access is the place to review or remove them. A future access model should track grant source if automatic revocation is desired.
