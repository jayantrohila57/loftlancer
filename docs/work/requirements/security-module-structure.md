# Requirements: Security module structure

> Superseded: Security capabilities are now standalone modules. See [module-structure.md](./module-structure.md) for the current standard.

**Status:** Draft — under discussion; not approved for implementation  
**Layers:** modules

## Goal

Organize the Security module by server, client, and utilities. Group server code by domain, with clear controller, service, and repository responsibilities. Preserve the existing Auth integration and API behavior when the plan is eventually implemented.

## Agreed structure

```text
modules/security/src/
├── server/
│   ├── security.router.ts
│   ├── activity/
│   │   ├── security.controller.activity.ts
│   │   ├── services/
│   │   │   ├── security.service.router.ts
│   │   │   ├── security.service.activity.list.ts
│   │   │   └── security.service.activity.delete.ts
│   │   └── repositories/
│   │       ├── security.repository.router.ts
│   │       ├── security.repository.activity.list.ts
│   │       ├── security.repository.activity.delete.ts
│   │       ├── security.repository.activity.locations.ts
│   │       └── security.repository.activity.record.ts
│   ├── location/
│   │   ├── security.controller.location.ts
│   │   ├── services/
│   │   │   ├── security.service.router.ts
│   │   │   ├── security.service.location.get.ts
│   │   │   ├── security.service.location.preference.ts
│   │   │   ├── security.service.location.save.ts
│   │   │   └── security.service.location.delete.ts
│   │   └── repositories/
│   │       ├── security.repository.router.ts
│   │       ├── security.repository.location.get.ts
│   │       ├── security.repository.location.preference.ts
│   │       └── security.repository.location.save.ts
│   ├── sessions/
│   │   ├── security.controller.sessions.ts
│   │   ├── services/
│   │   │   ├── security.service.router.ts
│   │   │   └── security.service.sessions.list.ts
│   │   └── repositories/
│   │       ├── security.repository.router.ts
│   │       └── security.repository.sessions.list.ts
│   └── providers/
│       ├── security.controller.providers.ts
│       └── services/
│           ├── security.service.router.ts
│           └── security.service.providers.list.ts
├── client/                               # Structure still to design
├── utils/
│   ├── config/
│   │   ├── security.config.activity.ts
│   │   ├── security.config.location.ts
│   │   ├── security.config.sessions.ts
│   │   └── security.config.providers.ts
│   ├── validation/
│       ├── security.validation.activity.ts
│       ├── security.validation.location.ts
│       ├── security.validation.sessions.ts
│       └── security.validation.providers.ts
│   ├── types/
│   │   ├── security.types.shared.ts
│   │   ├── security.types.activity.ts
│   │   ├── security.types.location.ts
│   │   ├── security.types.sessions.ts
│   │   └── security.types.providers.ts
│   └── constants/
│       ├── security.constants.shared.ts
│       ├── security.constants.activity.ts
│       ├── security.constants.location.ts
│       ├── security.constants.sessions.ts
│       └── security.constants.providers.ts
└── index.ts                              # Public module entry point
```

All named module files use the `security.` prefix; `index.ts` is the public entry-point exception. The filenames within the domains describe the intended split; confirm the full operation inventory before implementation.

## Responsibilities

- `security.router.ts` imports the four domain controllers and exports them as `securityRouter`. It replaces the previously proposed separate API and controller-routes files.
- Each controller defines its domain's oRPC procedures, connects route config and input/output schemas, and calls services. It does not contain business or database logic.
- Route metadata such as method, path, summary, and tags belongs in domain config files under `utils/config`.
- Input and output validation schemas belong under `utils/validation`. Types under `utils/types` are derived from those schemas with `z.infer`.
- Shared and domain-specific constants belong under `utils/constants`; shared utilities must not import secrets or server-only modules.
- Each service operation is in a separate file; its domain's service router groups those functions into an object used by the controller. Services contain business logic and call repositories.
- Repository operations are in separate files; their domain's repository router groups functions into an object used by services. Repositories handle data access. Providers may not need a repository because availability currently comes from server configuration.
- Preserve the existing frontend `api.security.use…` interface, oRPC and OpenAPI paths, Better Auth integration, and compatibility HTTP behavior unless the user decides otherwise.

## Example: module router

```ts
import { activityController } from "./activity/security.controller.activity"
import { locationController } from "./location/security.controller.location"
import { sessionsController } from "./sessions/security.controller.sessions"
import { providersController } from "./providers/security.controller.providers"

export const securityRouter = {
  activity: activityController,
  location: locationController,
  sessions: sessionsController,
  providers: providersController,
}
```

## Open decisions

- [ ] Design the contents of `client/`.
- [ ] Decide where the shared protected oRPC procedure and request context live.
- [ ] Decide where compatibility HTTP handlers live and how they reuse services while preserving their contracts.
- [ ] Decide where Better Auth database hooks and the database access helper live.
- [ ] Confirm the complete service and repository operation inventory, including cross-domain calls.
- [ ] Confirm whether config and validation remain grouped by type or should also be grouped by domain.
- [ ] Review the final plan and obtain explicit user approval before implementation.

## Implementation and verification, after approval

1. Audit the current interrupted file moves and existing uncommitted changes; preserve them while applying the approved structure.
2. Move and split server code by domain, keeping authentication, validation, error handling, and response behavior intact.
3. Arrange client code and utilities according to the final agreed plan; update imports and public exports.
4. Verify compatibility HTTP endpoints, oRPC and Scalar OpenAPI schemas and paths, session scoping, and origin enforcement with targeted tests. Run `pnpm test`, `pnpm check`, and direct Security and Auth typechecks; verify the Auth build as appropriate.

**Current workspace:** A prior file move was interrupted at the user's request. It has not been verified and does not represent approval of this plan.

## Client activity hooks (agreed direction)

The client root contains folders only. Each domain owns its hooks and components. Activity hooks are separated by operation and collected as `useActivityApi`:

```text
client/
└── activity/
    ├── hooks/
    │   ├── security.hooks.activity.ts
    │   ├── security.hook.activity.list.ts
    │   └── security.hook.activity.delete.ts
    └── components/
        └── ...
```

`useActivityApi.useList(...)` and `useActivityApi.useDelete()` delegate to individual React Query hooks. Hooks use the existing authenticated-user-scoped cache keys and invalidate affected queries. Placement of the shared oRPC client and module-wide API composition is still open.

## Shared API contract (proposed for discussion)

- Define operation input and output schemas once using Zod in shared validation files. Derive their TypeScript types with `z.infer`; do not hand-write duplicate API contract types.
- Controllers use the schemas for oRPC input and output validation. Client hooks use the inferred types and may use the same schemas for local validation; server validation remains authoritative.
- Proposed input structure: `{ query, payload, system }`, with operation-specific schemas. `query` is for filters, pagination, or selectors; `payload` is for operation data; `system` is reserved for trusted server-provided context. The exact optionality and wire representation remain open.
- Do not accept client-provided identity, permissions, session, or other trusted system values as authoritative. Resolve them from Better Auth and request context on the server. Whether `system` is excluded from the wire contract or supplied as a separate internal argument remains to be decided.
- Proposed output structure: `{ status, message, data, error }`, defined as a shared Zod discriminated union with operation-specific data and inferred types. Exact status values, nullability, error shape, and treatment of transport/validation failures remain open.
- Preserve real HTTP status codes, authentication and validation failures, oRPC error behavior, date serialization, and React Query error handling; do not imply that every network or transport failure can be wrapped by application code.
- Adopting a new envelope changes existing request and response contracts. Decide migration and compatibility strategy before implementation; update hooks and Scalar/OpenAPI together and retain existing HTTP compatibility behavior as agreed.
