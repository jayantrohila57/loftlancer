# Mobile dashboard consistency checklist

This checklist maps the dashboard routes to the shared responsive patterns. It is a source-level audit aid; visual viewport checks remain unverified because browser UI testing was explicitly declined.

## Target viewport pass

When visual checking is authorized, inspect each route at 320, 375, 430, and 768 CSS px in portrait and landscape. For each, check loading, empty, populated, error, restricted-access, long-text, keyboard focus, and row-action states where applicable.

- [ ] No page-level horizontal scrolling; intentional tab rails scroll horizontally.
- [ ] Primary and row actions remain visible, reachable, and at least 44px on touch layouts.
- [ ] Titles, breadcrumbs, descriptions, filters, and long identifiers wrap or truncate without hiding essential meaning.
- [ ] Tables preserve their primary identity and expose secondary details in the mobile identity cell.
- [ ] Sheets and dialogs fit the viewport, keep their footer actions reachable, and respect the safe area.
- [ ] Loading and empty states use the same content width and section structure as the loaded page.
- [ ] Keyboard focus order follows the visible order and icon-only controls have accessible names.
- [ ] Desktop workflows and table columns remain available at larger breakpoints.

## Route coverage

### Workspace and organization

- [ ] `/` workspace home, `/new` organization creation
- [ ] `/:org` overview and `/:org/activity`
- [ ] `/:org/projects`, `/:org/projects/new`
- [ ] `/:org/teams`, `/:org/teams/:teamId`
- [ ] `/:org/teams/:teamId/members`, `/invitations`, `/projects`, `/settings`
- [ ] `/:org/members`, `/:org/invitations`, `/:org/roles`, `/:org/settings`

### Project and application

- [ ] `/:org/:project` overview, `/access`, `/activity`, `/invitations`, `/settings`
- [ ] `/:org/:project/apps`, `/apps/:app`, `/apps/:app/settings`
- [ ] `/:org/:project/apps/env`, `/apps/env/:envSlug`, `/apps/env/settings`
- [ ] `/:org/:project/apps/tasks`, `/apps/tasks/:taskNumber`, `/apps/tasks/settings`
- [ ] Legacy `/:org/:project/env` and `/tasks` routes redirect to their canonical app routes.

### Account and support

- [ ] `/notifications`, account settings routes, `/support`, `/support/help`, `/support/tickets`, `/support/tickets/new`, `/support/tickets/:ticketId`

## Source-level checks completed

- Shared shell sidebar closes after mobile navigation; page/resource tabs use horizontal scroll rails.
- Data table search, primary action, and pagination controls have narrow-screen layouts and touch targets.
- Organization member and invitation rows retain identity, access scope, team role, and linked-project context on mobile.
- Team and project access controls fit narrow widths; project status and visibility remain visible beside identity.
- Environment variable actions and task details remain reachable on narrow screens.
- Management sheets use the mobile viewport and safe-area-aware footer spacing.

## Outstanding visual verification

The route/state/viewport matrix above has not been exercised in a browser. This document intentionally does not claim that every rendered state is visually verified.
