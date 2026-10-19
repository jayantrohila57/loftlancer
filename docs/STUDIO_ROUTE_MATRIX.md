# Studio route and data-flow matrix

This matrix records the current route contract for the dashboard hierarchy work (#491–#500). Route groups use the public `/studio` prefix; the source paths omit it because Studio is mounted at that base path. A route's layout guards scope access before rendering its page. Route-specific server guards, metadata, and hydration are called out where present.

## Scope frames

| Scope | Route layout | Responsibility | Data bootstrap |
| --- | --- | --- | --- |
| Authenticated Studio | `apps/studio/src/app/(private)/(shell)/layout.tsx` | `PrivateDashboardShell`, personal/global navigation, auth guard, request-path org hint | `dehydrateStudioShellQueries(session, { urlOrgSlug })`; shell queries hydrate through TanStack Query |
| Organization | `apps/studio/src/app/(private)/(shell)/[org]/layout.tsx` | Reserved-slug check, membership guard, subtree preflight, `OrganizationLayoutShell` | URL org is synchronized by `proxy.ts`; shell and domain hooks read hydrated org queries |
| Project | `apps/studio/src/app/(private)/(shell)/[org]/[project]/layout.tsx` | Project access guard and `ProjectLayoutShell` | project page guards hydrate project queries; app/task/environment hooks use project-scoped tRPC queries |
| Personal account | `apps/auth/src/app/(account)/settings/layout.tsx` | Separate Auth app account settings frame and auth state | Auth/session queries; no organization mutation scope |
| Public invitation | `apps/studio/src/app/(public)/invite/[invitationId]/page.tsx` | Invitation acceptance without requiring membership first | Server invitation lookup and acceptance flow |

## Route matrix

| Destination | Page / domain surface | Main data and action path | Parent / return |
| --- | --- | --- | --- |
| `/studio` | Home / organization directory and incoming invitations | Organization directory hooks and invitation queries | Personal Studio home |
| `/studio/new` | Organization create flow | Organization create mutation, guarded by canonical organization action | `/studio` |
| `/studio/notifications` | Notification feed and unread filter | `useNotificationsList`, `useNotificationsUnreadCount`, notification read mutations; typed destinations from `@loftlancer/notifications` | `/studio` |
| `/studio/activity` | Personal activity | `TimelinePageClient` / audit queries, based on audit feature flag | `/studio` |
| `/studio/support` | Support landing | Support entry links | `/studio` |
| `/studio/support/tickets` | Ticket directory | Ticket queries, search/table rows | `/studio/support` |
| `/studio/support/tickets/new` | New ticket | Ticket create mutation | `/studio/support/tickets` |
| `/studio/support/tickets/:ticketId` | Ticket detail and replies | Ticket detail query and reply mutation | `/studio/support/tickets` |
| `/studio/support/help` | Help directory | Help article queries/search | `/studio/support` |
| `/studio/support/help/:slug` | Help article | Article lookup by slug; unknown article uses the route not-found boundary | `/studio/support/help` |
| Auth app `/settings` and `/settings/:section` | Personal account settings index and Profile, Security, Sessions, Connected accounts, Notifications, Activity, Danger zone sections | Better Auth/session and account-specific actions | Account settings index in the separate Auth app; opened through the account app origin |
| `/studio/:org` | Organization overview | Organization detail query and org-scoped summary hooks | `/studio` organization directory |
| `/studio/:org/projects` | Organization project directory | Project list/search/filter hooks and project create sheet | `/studio/:org` |
| `/studio/:org/projects/new` | Project create route | Project create workflow; same project-list scope | `/studio/:org/projects` |
| `/studio/:org/members` | Organization members | Member list, role/access queries and member mutations | `/studio/:org` People area |
| `/studio/:org/invitations` | Organization invitations | Invitation list/create/resend/revoke hooks | `/studio/:org` People area |
| `/studio/:org/teams` | Organization teams | Team list and create/edit/delete hooks | `/studio/:org` People area |
| `/studio/:org/teams/:teamId` | Team detail, members and linked projects | Team detail query; linked project results filtered by `project.read`; member management opens the existing members surface | `/studio/:org/teams` |
| `/studio/:org/roles` | Organization roles and access explanation | Role/permission metadata and org scope | `/studio/:org` People area |
| `/studio/:org/activity` | Organization activity | `TimelinePageClient` / audit queries with org scope | `/studio/:org` |
| `/studio/:org/settings` | Organization identity and lifecycle | Organization detail/update hooks and canonical permission gates | `/studio/:org` |
| `/studio/:org/:project` | Project overview, status and access summary | Project detail/access queries; links to installed app destinations | `/studio/:org/projects` |
| `/studio/:org/:project/settings` | Project identity, access and lifecycle settings | Project update/access hooks; canonical server permission checks | `/studio/:org/:project` |
| `/studio/:org/:project/apps` | App directory and install management | `useProjectApps`; install/uninstall/configure mutations and invalidation | `/studio/:org/:project` |
| `/studio/:org/:project/:app` | Installed app work surface | `AppGate` → app-specific domain hook/API; Environments and Tasks use static app routes | `/studio/:org/:project/apps` or the app's parent item list |
| `/studio/:org/:project/:app/settings` | Installed app configuration | `AppGate` → `AppSettingsPage` → `useProjectApps` and `projectApps.configure`; Tasks and Environments settings are static routes below | app work surface; uninstalled-app action returns to Apps when manageable |
| `/studio/:org/:project/env` | Environments list and selected environment | `useEnvironments`, `useEnvironmentVariableCounts`; environment tabs are URL links | Project Apps / Environments |
| `/studio/:org/:project/env/:envSlug` | Environment variables for one target | Project environment detail query and variable CRUD hooks | `/studio/:org/:project/env` |
| `/studio/:org/:project/env/settings` | Environments app settings | Static `AppSettingsPage` route for `env` | `/studio/:org/:project/env` |
| `/studio/:org/:project/tasks` | Task list, filters and create action | `TasksPage` task list/people/permission hooks; task create mutation | Project Apps / Tasks |
| `/studio/:org/:project/tasks/:taskNumber` | Task detail (direct URLs open the task sheet) | `tasks.get`, task update/comment/delete mutations; unavailable task now offers retry or a task-list explanation | `/studio/:org/:project/tasks` |
| `/studio/:org/:project/tasks/settings` | Tasks app settings | Static `AppSettingsPage` route for `tasks` | `/studio/:org/:project/tasks` |
| `/studio/invite/:invitationId` | Invitation acceptance | Public invitation lookup/accept route, linked from invitation notifications | `/studio` or organization overview after acceptance |

## Route precedence and navigation rules

- Static `env`, `tasks`, and `apps` routes take precedence over the generic `:app` segment. In particular, `/env/settings` and `/tasks/settings` are app settings routes, not environment/task items.
- `/tasks/:taskNumber` validates a positive integer on the server and renders the task list with the matching task detail sheet open. The sheet closes to the task list; its error state covers removed or inaccessible tasks.
- `/env/:envSlug` is a real destination. Tabs use links so refresh, copy-link, and modified-click behavior preserve the selected environment.
- Generic app IDs that do not resolve to a known app return not found; known but uninstalled apps show an install/access explanation. Only project managers can navigate onward to Apps to install.
- Organization routes are URL-scoped; the org layout guards membership and synchronizes the active org. The shell hides project links until org context is resolved.
- Team shortcuts use `/teams/:teamId`; the legacy query form remains supported and opens the same selected team detail.
- Breadcrumbs represent the scope chain. Back controls are omitted when they repeat a sibling/tab action; project-level and app-level parents are resolved by `ProjectLayoutShell`.
- Notification destinations are event-specific: task events open task detail when the organization slug exists, invitations open acceptance or the owning organization, and ticket replies open ticket detail. Old task events without an org slug fall back to the notification inbox because their destination cannot be reconstructed safely.

## Data-flow findings and verification

The normal path is server route guard/metadata → hydrated scope shell → domain client surface → React Query/tRPC hook → server router/action with canonical permission checks. Shell prefetch shares cached organization/project identity queries with pages where query keys match. Several page surfaces still invoke their own project/org hooks, so the cache avoids some repeat network work but data ownership is not yet fully centralized. Do not infer that every route has one server-prefetched query or a single shared permission object.

| Check | Current state |
| --- | --- |
| Route inventory and parent destinations | Recorded above; source review completed for all Studio route families, including account/support and dynamic app/item routes |
| Type and route-literal checks | Run on the final branch before merge; results recorded in the PR/parent issue |
| Browser verification of loading, empty, error, and success states | Must be run against a configured local `pnpm --filter studio dev` instance; fixture credentials/data are required for authenticated route coverage |
| Desktop/narrow viewport and keyboard review | Requires a browser pass over the authenticated fixture routes before merge |
| Owner/Manager/Member/no-access comparison | Permission guards are source-reviewed; each live role scenario needs matching seeded fixture accounts |
| Five-person task-based usability study | Not performed; recruit five representative participants and attach task completion, misclick, and time-to-target findings before closing #491/#500 |

### Human walkthrough tasks

1. Find an organization, invite a person, and check invitation status.
2. Find a team, add a member, and explain which projects the team can access.
3. Create a project and explain who can see it.
4. Open Apps, configure Environments, and navigate to a production environment.
5. Create a task, open its detail from a notification, and return to Tasks.

Record completion without hints, wrong turns, dead ends, time to target, and participants' own explanation of each scope. Do not count a source review or an agent walkthrough as user-study evidence.
