# Organizations module

Organization membership, invitations, settings, and lifecycle features. Parent migration issue: [#929](https://github.com/jayantrohila57/loftlancer/issues/929).

**Platform rules (read-only index):** [docs/modules.md](../../docs/modules.md) · [docs/naming.md](../../docs/naming.md) · [docs/new-feature-checklist.md](../../docs/new-feature-checklist.md)

---

## Agent workflow

1. Implement one open sub-issue at a time on `feat/929-organizations-<slug>`, based on `dev`; follow the ordered handoff in [ARCHITECTURE-100-PROMPT.md](./ARCHITECTURE-100-PROMPT.md).
2. Plan before code when a slice crosses utils, server, transport, or client boundaries.
3. Reference `module/organizations/`, `module/teams/`, `module/shared/`, and native oRPC patterns. Legacy paths below are compatibility/reference sources only, never templates.
4. Make one commit per sub-issue with `Fixes #<sub-issue>` and `Refs #929`.
5. If external work blocks a slice, document it under [TODO (blocked)](#todo-blocked); do not add cross-module shortcuts.

---

## Flow

The target flow is:

`app route re-export → module RSC → server/page → controller → runAction → service`

`client hook → @/lib/orpc → packages/api/src/orpc/procedures/organizations.ts → same controller`

Compatibility tRPC and MCP adapters should call the same module controllers and unwrap `ServiceResponse` only at their transport boundary. Outbound controller responses must be validated with `serviceResponseSchema(...).parse`.

## Current migration state

This is a partial migration. Organization list, get-by-slug, get-profile, member list/remove, invitation list/create/revoke/resend/preview, team/project invitation acceptance, organization settings/profile/branding, custom-role operations, security domains, lifecycle, and member administration now have module validations, services, and controllers. Shared invitation email parsing and invitation utilities are in this module, and invitation persistence/delivery is implemented by `server.invitation-create.service.ts`. Teams' invitation flow and the organization MCP invitation operation reuse that service. Organization screens, their hooks, native oRPC procedures, and compatibility adapters remain in the legacy Studio module and API router until their linked slices migrate them.

### Migration boundaries

- New organization product logic belongs in `module/organizations/{utils,server,client}/` and native oRPC. Keep routes thin and preserve existing route behavior as each client slice lands.
- `apps/studio/src/module/organizations/` and `packages/api/src/routers/organizations.ts` are compatibility and behavior references only. Do not copy them as implementation templates.
- `packages/api/src/modules/organizations/` is legacy compatibility code; do not add new product logic there.
- Keep shared invitation behavior compatible with its Teams and MCP consumers. Prefer the existing service/controller seams over direct cross-domain writes.
- Do not add product tRPC procedures or `z.unknown()` oRPC inputs. Controllers validate their inputs and parse outbound `ServiceResponse` values.

### Directory map

```text
module/organizations/
├── utils/
│   ├── utils.invite-emails.ts
│   ├── utils.invitations.ts
│   ├── utils.public-invitation-status.ts
│   ├── utils.domain-verification.ts
│   └── validation/
│       ├── utils.organization-list.validation.ts
│       ├── utils.organization-get-by-slug.validation.ts
│       ├── utils.organization-get-profile.validation.ts
│       ├── utils.organization-members.validation.ts
│       ├── utils.organization-invitations.validation.ts
│       └── utils.organization-admin.validation.ts
├── server/
│   ├── controller/
│   │   ├── server.organization-list.controller.ts
│   │   ├── server.organization-get-by-slug.controller.ts
│   │   ├── server.organization-get-profile.controller.ts
│   │   ├── server.organization-settings.controller.ts
│   │   ├── server.organization-roles.controller.ts
│   │   ├── server.organization-security-domains.controller.ts
│   │   ├── server.organization-lifecycle.controller.ts
│   │   ├── server.organization-member-admin.controller.ts
│   │   ├── server.organization-members.controller.ts
│   │   ├── server.organization-member-remove.controller.ts
│   │   └── server.organization-invitation-*.controller.ts
│   └── service/
│       ├── server.organization-list.service.ts
│       ├── server.organization-get-by-slug.service.ts
│       ├── server.organization-get-profile.service.ts
│       ├── server.organization-settings.service.ts
│       ├── server.organization-roles.service.ts
│       ├── server.organization-security-domains.service.ts
│       ├── server.organization-lifecycle.service.ts
│       ├── server.organization-member-admin.service.ts
│       ├── server.organization-member-*.service.ts
│       ├── server.organization-invitation-*.service.ts
│       └── server.invitation-create.service.ts
├── client/                 # organization client migration slices
├── README.md
└── ARCHITECTURE-100-PROMPT.md
```

## Verification

Run the checks required by the sub-issue and its prompt. The architecture audit and typecheck are required for module/oRPC changes; run relevant focused tests where specified.

```bash
pnpm audit:module-architecture
pnpm check-types
```

After slices A–G are complete, run `pnpm verify:dev-merge` on the full branch before opening the parent PR to `dev`.

## Sub-issues (parent #929)

Implement in this order; do not skip ahead of an open dependency:

| Sub-issue | Scope | Status |
|-----------|-------|--------|
| [#938](https://github.com/jayantrohila57/loftlancer/issues/938) | README, architecture prompt, module index | Implemented on this branch |
| [#939](https://github.com/jayantrohila57/loftlancer/issues/939) | A — validations and read controllers | Implemented on this branch |
| [#940](https://github.com/jayantrohila57/loftlancer/issues/940) | B — invitations and members controllers | Implemented on this branch |
| [#973](https://github.com/jayantrohila57/loftlancer/issues/973) | C — settings, branding, roles, domains, lifecycle, member administration | Implemented on this branch |
| [#974](https://github.com/jayantrohila57/loftlancer/issues/974) | D — native oRPC organizations | Open |
| [#975](https://github.com/jayantrohila57/loftlancer/issues/975) | E — client migration, phase 1 | Open |
| [#976](https://github.com/jayantrohila57/loftlancer/issues/976) | F — client migration, phase 2 | Open |
| [#977](https://github.com/jayantrohila57/loftlancer/issues/977) | G — compatibility adapters, integration, baseline, final verification | Open |

## TODO (blocked)

| Item | Blocked on | Issue | Notes |
|------|------------|-------|-------|
| None currently recorded | — | — | Add a row only when a concrete dependency blocks a slice. |

## Changelog

User-facing changes for this module go in root [CHANGELOG.md](../../CHANGELOG.md) under `[Unreleased]` when merged to `dev`.
