# Teams reference pilot (#916)

All `/[org]/teams` routes use module page loaders, the same controllers as native oRPC, validated ServiceResponse output, and dynamic client boundaries. Team detail routes share `TeamsSectionLayout`; the existing Studio shell remains in place.

## Flow

`app route re-export → module RSC → server/page → controller → runAction → service`

`client hook → @/lib/orpc → packages/api/src/orpc/procedures/teams.ts → same controller`

`runAction` authorizes with the platform evaluator using `audit: false`, then records one terminal mutation outcome. It maps permission denial to `failed`, preserves field errors, and returns safe error details for unexpected failures. Create inserts the team and its creator's lead membership in one transaction. Member services retain organization checks, last-lead protection, and linked-project defaults.

The native teams namespace includes list, get, create, update, delete, restore, members, availableMembers, addMember, removeMember, updateMemberRole, projects, linkableProjects, projectAssign, projectRemove, invitationList, invitationContext, invitationCreate, invitationResend, and invitationRevoke. Input remains untrusted through the transport so controllers can audit validation failures. Hooks validate/type their inputs; controllers own runtime Zod validation.

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

## Verification

- `pnpm test:teams`: controller validation, terminal audit outcomes, safe system errors, and response invariants, with mocked platform boundaries.
- `TEST_TEAMS_DATABASE_URL=postgresql://.../loftlancer_teams_916 pnpm test:teams:integration`: opt-in database smoke test. It refuses non-local hosts and other database names. Create only a disposable local database; the test removes its fixture rows.
- `TEST_TEAMS_MIGRATION_DATABASE_URL=postgresql://.../loftlancer_teams_918 pnpm test:teams:integration`: opt-in migration integration checks against a separate disposable local database. Checks grants/link restoration, invitation validation/duplicates/role and organization scope, resend/revoke, delivery failure cancellation, and terminal audits. Email delivery is mocked; no external email is sent.
- Browser QA uses the existing local E2E login with an isolated Postgres instance. Verify create → overview, members/projects/settings/invitations tabs, search, invalid create, keyboard/dialog behavior, and 375px layout.

The pilot uses shadcn, COSS, COSS particles, and UI/UX Pro Max guidance. Existing shell-level Base UI `nativeButton` warnings are outside the pilot's client islands.

## Migration verification (#918)

- Workspace typechecks: all 18 tasks passed; API 164 tests, Studio 113 tests, and shared/controller 4 tests passed.
- Isolated Postgres integration verified invitation validation, duplicates, member exclusion, scope, list/context, resend/revoke, delivery cancellation, default project grants, link restoration, and single terminal audits.
- Authenticated local browser verified every team tab, native project link/unlink, invitation revoke, email-delivery failure with retained draft, duplicate/invalid previews, guarded close, and 375px footer visibility. No page errors or horizontal overflow. Existing global shell Base UI warnings remain outside team islands.

## Pilot checklist

- [x] Open issue #916; feature branch from dev; PR targets dev.
- [x] Shared validation/query keys, per-operation services/controllers, and page loaders for every team screen.
- [x] Native teams oRPC; mutations use permission checks and terminal audit.
- [x] Shared detail layout/tabs, dynamic islands, response boundaries, and route states.
- [x] Thin teams app route re-exports; legacy teams folder removed.
- [x] UI skills applied; desktop/mobile, keyboard validation focus, and unsaved-draft checks.
- [x] Typecheck, lint, affected API/Studio tests, isolated DB smoke, and Studio build.
- [x] Unreleased changelog entry and Fixes #916 commit footer.

GitHub exposed no open Loftlancer project when issue #916 was created, so no project item could be attached.
