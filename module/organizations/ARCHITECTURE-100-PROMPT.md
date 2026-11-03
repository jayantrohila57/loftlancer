# Organizations module migration — agent handoff

Use this prompt for the ordered sub-issues of parent [#929](https://github.com/jayantrohila57/loftlancer/issues/929). Work on branch `feat/929-organizations-<slug>` based on `dev`; use one commit per sub-issue with `Fixes #<sub-issue>` and `Refs #929`. The final PR targets `dev` and closes #929 after all slices are complete.

## Goal

Complete the organizations migration into `module/organizations/` while preserving route behavior and satisfying the repository's module and oRPC architecture rules. Implement only the currently next open sub-issue from the ordered list below. The parent issue describes the outcome; each sub-issue is one verifiable implementation unit.

## Read first

1. Root `AGENTS.md`, `module/AGENTS.md`, and this module's README.
2. `module/README.template.md`, `docs/new-feature-checklist.md`, and `docs/architecture-gaps.md`.
3. `module/teams/README.md` and the relevant Teams controller, validation, and native oRPC patterns.
4. `docs/server-api.md`, `docs/actions-and-events.md`, and `docs/tooling.md` when the slice touches those contracts.

Follow the applicable checklist one section at a time. Plan before coding whenever the slice crosses utils, server, transport, or client boundaries.

## Architecture rules

- New product logic belongs in `module/organizations/{utils,server,client}/`; routes stay thin and call native oRPC/module flows.
- Do not use `apps/studio/src/module/organizations/*`, `packages/api/src/modules/organizations/*`, or `packages/api/src/routers/organizations.ts` as templates. Consult them only to preserve existing behavior and compatibility.
- Do not add product tRPC procedures, `z.unknown()` inputs, or bypasses. Each controller validates input and validates outbound data with `serviceResponseSchema(<outputSchema>).parse`.
- Keep controllers thin: authorization/audit through `runAction`, with business logic in services. Reuse `module/shared/` seams when appropriate.
- Preserve invitation behavior shared with Teams and MCP; adapt compatibility callers at the transport boundary rather than duplicating domain logic.
- If a concrete dependency blocks progress, stop that slice and record `## TODO (blocked)` in `module/organizations/README.md`, including the dependency and issue.
- Make one commit per sub-issue: `Fixes #<sub-issue>` and `Refs #929`.

## Ordered sub-issues

Proceed in this order and implement only the next open item:

| Order | Issue | Scope |
|-------|-------|-------|
| 0 | [#938](https://github.com/jayantrohila57/loftlancer/issues/938) | Module README, architecture handoff prompt, module index link |
| A | [#939](https://github.com/jayantrohila57/loftlancer/issues/939) | Validation schemas and read controllers: list, get by slug, get profile |
| B | [#940](https://github.com/jayantrohila57/loftlancer/issues/940) | Invitation and member controllers |
| C | [#973](https://github.com/jayantrohila57/loftlancer/issues/973) | Settings, branding, custom roles, domains, lifecycle, member administration |
| D | [#974](https://github.com/jayantrohila57/loftlancer/issues/974) | Native oRPC organizations procedures with operation-specific schemas |
| E | [#975](https://github.com/jayantrohila57/loftlancer/issues/975) | Client migration, phase 1 |
| F | [#976](https://github.com/jayantrohila57/loftlancer/issues/976) | Client migration, phase 2 |
| G | [#977](https://github.com/jayantrohila57/loftlancer/issues/977) | Compatibility tRPC/MCP adapters, integration coverage, empty audit baseline, final checks |

## Checks and completion

Run the checks listed by the active sub-issue and the applicable checklist. For module/server/oRPC implementation, run:

```bash
pnpm audit:module-architecture
pnpm check-types
```

Run relevant focused tests for the touched domain and transport. In slice #977, establish the required architecture baseline only after fixing violations; do not edit the baseline to hide them. After A–G are complete, run:

```bash
pnpm verify:dev-merge
```

Open a PR to `dev` that lists the completed sub-issues and closes #929. Report the audit, typecheck, focused test, and full branch verification results separately.
