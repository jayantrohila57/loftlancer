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

`client hook → @/lib/orpc → packages/orpc/src/orpc/procedures/organizations.ts → same controller`

Compatibility tRPC and MCP adapters should call the same module controllers and unwrap `ServiceResponse` only at their transport boundary. Outbound controller responses must be validated with `serviceResponseSchema(...).parse`.

## Current migration state

The organizations migration is complete for the linked scope. Organization reads, membership, invitations (including project-scoped list/revoke/resend), settings/profile/branding, custom-role operations, security domains, lifecycle, and member administration use module validations, services, and controllers. Shared invitation email parsing and invitation utilities are in this module, and invitation persistence/delivery is implemented by `server.invitation-create.service.ts`. Teams' invitation flow and organization MCP invitation acceptance reuse module operations. The organization directory, create flow, shell, tabs, overview, settings, members, roles, invitations, and public invitation landing live in `client/studio/`; Studio route files are thin module exports and migrated reads and writes use native oRPC. Organization creation remains on Better Auth's organization-create API until a module create operation is introduced. tRPC and MCP compatibility adapters call module controllers for operations implemented here.

### Migration boundaries

- New organization product logic belongs in `module/organizations/{utils,server,client}/` and native oRPC. Keep routes thin and preserve existing route behavior as each client slice lands.
- `apps/studio/src/module/organizations/` and `packages/orpc/src/routers/organizations.ts` are compatibility and behavior references only. Do not copy them as implementation templates.
- `packages/orpc/src/modules/organizations/` is legacy compatibility code; do not add new product logic there.
- Keep shared invitation behavior compatible with its Teams and MCP consumers. Prefer the existing service/controller seams over direct cross-domain writes.
- Do not add product tRPC procedures or `z.unknown()` oRPC inputs. Controllers validate their inputs and parse outbound `ServiceResponse` values.

### Directory map

```text
module/organizations/
├── utils/
│   ├── utils.invite-emails.ts
│   ├── utils.invitations.ts
│   ├── utils.member-removal-policy.ts
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
│   ├── page/               # guarded RSC loaders for Studio organization routes
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
│   └── studio/
│       ├── components/     # directory, create, card, overview, settings, and membership UI
│       ├── hooks/          # oRPC-backed organization operations and identity reads
│       ├── layout/         # organization shell and tabs
│       ├── rsc/            # Studio route boundaries and metadata
│       ├── skeletons/      # organization list and overview route states
│       └── config/         # organization shell route matching
├── README.md
└── ARCHITECTURE-100-PROMPT.md
```

## Verification

Run the checks required by the sub-issue and its prompt. The architecture audit and typecheck are required for module/oRPC changes; run relevant focused tests where specified.

```bash
pnpm audit:module-architecture
pnpm check-types
```

## Native oRPC procedures

The `organizations` namespace is registered in `packages/orpc/src/orpc/studio-router.ts`. Its typed procedures call module controllers only:

- Reads: `list`, `getBySlug`, `getProfile`, `members`, `myInvitations`, `invitationList`, `invitationPreview`, `settings`, `customRoles`, `securityDomains`, `memberAccessSummary`.
- Invitations: `invitationCreate`, `invitationRevoke`, `invitationResend`, `acceptTeamInvitation`, `acceptProjectInvitation`.
- Settings and administration: `updateSettings`, `updateProfile`, `updateBrandingLogo`, `createCustomRole`, `updateCustomRole`, `deleteCustomRole`, `assignCustomRole`, `createSecurityDomain`, `verifySecurityDomain`, `revokeSecurityDomain`, `archive`, `unarchive`, `transferOwnership`, `updateMemberProfile`, `setMemberSuspended`, `removeMember`.

After slices A–G are complete, run `pnpm verify:dev-merge` on the full branch before opening the parent PR to `dev`.

Opt-in integration coverage for invitation delivery, member removal, and custom-role assignment availability is available with `pnpm test:organizations:integration`. Set `TEST_ORGANIZATIONS_DATABASE_URL` to a disposable local database named `loftlancer_organizations_929`; the test skips when the variable is unset and rejects non-local hosts.

## Sub-issues (parent #929)

Implement in this order; do not skip ahead of an open dependency:

| Sub-issue                                                       | Scope                                                                    | Status                     |
| --------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------- |
| [#938](https://github.com/jayantrohila57/loftlancer/issues/938) | README, architecture prompt, module index                                | Implemented on this branch |
| [#939](https://github.com/jayantrohila57/loftlancer/issues/939) | A — validations and read controllers                                     | Implemented on this branch |
| [#940](https://github.com/jayantrohila57/loftlancer/issues/940) | B — invitations and members controllers                                  | Implemented on this branch |
| [#973](https://github.com/jayantrohila57/loftlancer/issues/973) | C — settings, branding, roles, domains, lifecycle, member administration | Implemented on this branch |
| [#974](https://github.com/jayantrohila57/loftlancer/issues/974) | D — native oRPC organizations                                            | Implemented on this branch |
| [#975](https://github.com/jayantrohila57/loftlancer/issues/975) | E — client migration, phase 1                                            | Implemented on this branch |
| [#976](https://github.com/jayantrohila57/loftlancer/issues/976) | F — client migration, phase 2                                            | Implemented on this branch |
| [#977](https://github.com/jayantrohila57/loftlancer/issues/977) | G — compatibility adapters, integration, baseline, final verification    | Implemented on this branch |

## TODO (blocked)

| Item                                                                                                  | Blocked on                                                                                    | Issue | Notes                                                                                                     |
| ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------------------------------------- |
| MCP `organization-ops` still calls `server.organization-transfer-ownership.legacy` (TRPCError throws) | Switch MCP to `organizationTransferOwnershipController` + ServiceResponse unwrap at transport | —     | Legacy helper lives under this module so `@loftlancer/orpc` stays a shim; delete legacy after MCP cutover |
| Root `@loftlancer/orpc/organization-*-validation` shims                                               | Apps/MCP import `@modules/organizations/...` directly                                         | —     | Schemas are canonical in `utils/validation/utils.organization-admin.validation.ts`                        |

## Changelog

User-facing changes for this module go in root [CHANGELOG.md](../../CHANGELOG.md) under `[Unreleased]` when merged to `dev`.
