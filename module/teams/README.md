# Teams reference pilot (#916)

The `/[org]/teams` list and `/[org]/teams/[teamId]` overview use module page loaders, the same controllers as native oRPC, validated ServiceResponse output, and dynamic client boundaries. Team detail routes share `TeamsSectionLayout`; the existing Studio shell remains in place.

## Flow

`app route re-export → module RSC → server/page → controller → runAction → service`

`client hook → @/lib/orpc → packages/api/src/orpc/procedures/teams.ts → same controller`

`runAction` authorizes with the platform evaluator using `audit: false`, then records one terminal mutation outcome. It maps permission denial to `failed`, preserves field errors, and returns safe error details for unexpected failures. Create inserts the team and its creator's lead membership in one transaction. Member services retain organization checks, last-lead protection, and linked-project defaults.

The native teams namespace includes list, get, create, update, delete, restore, members, availableMembers, addMember, removeMember, updateMemberRole, projects, and linkableProjects. Input remains untrusted through the transport so controllers can audit validation failures. Hooks validate/type their inputs; controllers own runtime Zod validation.

## Migration boundaries

- Members and settings use native teams oRPC hooks. Project-list reads use the same native controllers; project assignment mutations remain with the existing project-access feature.
- Invitations retain the shared organization invitation flow, including its existing transport, email delivery, and bulk-invite dialog. They are rendered from the module-owned route rather than duplicated here.
- The tRPC teams router and MCP organization-ops functions are compatibility adapters to the module controllers. Existing callers keep their raw `{ items }` / object payloads; native oRPC and RSC consumers use ServiceResponse.
- Migrated non-pilot panels still compose existing Studio table, confirmation, permission, and invitation infrastructure. These app-specific dependencies are transitional; they are not examples for new module code.
- Studio `lib/team-*` bridges expose existing platform context, permissions, and dialog guards. Query/transport hooks import the app's `lib/orpc` entrypoint.
- Module-only typecheck covers shared contracts and teams server/utils. Studio's typecheck covers the app-specific RSC/client sources. All apps that traverse API types have the `@module/*` alias.
- The existing `@loftlancer/module-shared` workspace supplies dependencies for root module source; no teams package was added. Turbo hashes `module/**`, and Studio Tailwind scans it.

## Verification

- `pnpm test:teams`: controller validation, terminal audit outcomes, safe system errors, and response invariants, with mocked platform boundaries.
- `TEST_TEAMS_DATABASE_URL=postgresql://.../loftlancer_teams_916 pnpm test:teams:integration`: opt-in database smoke test. It refuses non-local hosts and other database names. Create only a disposable local database; the test removes its fixture rows.
- Browser QA uses the existing local E2E login with an isolated Postgres instance. Verify create → overview, members/projects/settings/invitations tabs, search, invalid create, keyboard/dialog behavior, and 375px layout.

The pilot uses shadcn, COSS, COSS particles, and UI/UX Pro Max guidance. Existing shell-level Base UI `nativeButton` warnings are outside the pilot's client islands.

## Pilot checklist

- [x] Open issue #916; feature branch from dev; PR targets dev.
- [x] Shared validation/query keys, per-operation services/controllers, and list/overview page loaders.
- [x] Native teams oRPC; mutations use permission checks and terminal audit.
- [x] Shared detail layout/tabs, dynamic islands, response boundaries, and route states.
- [x] Thin teams app route re-exports; legacy teams folder removed.
- [x] UI skills applied; desktop/mobile, keyboard validation focus, and unsaved-draft checks.
- [x] Typecheck, lint, affected API/Studio tests, isolated DB smoke, and Studio build.
- [x] Unreleased changelog entry and Fixes #916 commit footer.

GitHub exposed no open Loftlancer project when issue #916 was created, so no project item could be attached.
