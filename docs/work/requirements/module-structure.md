# Requirements: Standard module structure

**Status:** Implementing — Security pilot  
**Approved by:** user (2026-11-08, “ok start working on it”)  
**Layers:** modules; app integration where needed

## Goal

Use one consistent structure for modules, grouping server and client code by domain while keeping shared configuration, contracts, inferred types, and constants in utilities. Apply the pattern to standalone capability modules, beginning with activity; migrate other modules according to their actual capabilities.

## Standard tree

```text
modules/<module>/src/
├── server/
│   ├── <module>.router.ts
│   ├── <module>.controller.ts
│   ├── services/
│   │   ├── <module>.service.router.ts
│   │   └── <module>.service.<operation>.ts
│   └── repositories/
│       ├── <module>.repository.router.ts
│       └── <module>.repository.<operation>.ts
├── client/
│   ├── hooks/
│   │   ├── <module>.hooks.ts
│   │   └── <module>.hook.<operation>.ts
│   └── components/
├── utils/
│   ├── config/
│   ├── validation/
│   ├── types/
│   └── constants/
└── index.ts
```

All module filenames use the module prefix except `index.ts`. Client root contains folders only. Each capability is its own standalone module; do not nest domains or submodules. Create layers, routers, and utility files only where needed; not every domain uses a database, oRPC, React Query, or UI.

## Server

- `<module>.router.ts` collects domain controllers and exposes the module oRPC router.
- Controllers define oRPC procedures, connect route metadata and input/output validation, and call services. Resolve authorization and trusted request context at the appropriate server boundary.
- Each service operation has its own file. The module service router groups operations into an object; services implement business logic.
- Each repository operation has its own file. The module repository router groups operations into an object; repositories handle persistence and data access.
- Keep compatibility HTTP endpoints available while consumers migrate, retaining their authentication, status codes, and existing contracts. Their final file placement is open.

## Client

- Each module contains operation-specific React Query hooks and a hooks collection, e.g. `useActivityApi.useList(...)`. Hooks call the appropriate oRPC client, Better Auth client, or other API and own query keys, cache invalidation, and mutation state.
- Components render UI and call those hooks. Place server-rendered components carefully so imports do not cross the client/server boundary accidentally; folder names alone do not create a Next.js client boundary.
- Resolve the placement of shared oRPC client setup and composition of the app-wide `api.<module>` chain before migration. Preserve existing public hooks until a migration is agreed.

## Shared contracts

- Config files contain route method, path, summary, tags, and other route metadata.
- Zod schemas define operation input and output, shared error schemas, and response envelopes. Derive exported types from schemas with `z.infer`; do not duplicate API contract types by hand.
- Clients use inferred types and can validate locally; server validation is authoritative. Use oRPC router inference where appropriate and ensure shared utilities contain no server-only dependencies.
- Proposed input groups are `query` (selectors, filters, pagination), `payload` (operation data), and `system` (trusted server context). Identity, session and authorization values must come from trusted server context, never client input. Decide whether `system` is a separate internal argument and whether unused groups are omitted.
- API exits use the Loftlancer `ServiceResponse` triad and envelope defined below. Operation-specific schemas validate `data`; controllers map internal `ServiceOutcome` values and parse the final response before returning it.
- Constants contain shared and domain-specific fixed values; avoid storing secrets or environment-specific server values in client-importable utilities.
- Date, file, and other non-JSON values need an explicit transport and schema strategy for both RPC and OpenAPI.

## Service outcome and response contract

Mirror the supplied Loftlancer pattern across oRPC, actions, HTTP routes, and MCP API exits:

```ts
{
  status: "success" | "failed" | "error",
  data: T | T[] | null,
  message: string,
  error?: unknown,
}
```

- `success`: operation completed; an empty list remains successful and renders an empty state.
- `failed`: expected and fixable rejection, such as user input, duplicate names, or permission denial. Field errors may be provided in `error`.
- `error`: unexpected or system failure. It requires error detail, with safe information exposed to clients.
- Loading is hook or route pending state, never a response status.
- Provide `createSuccess`, `createFailed`, and `createError` helpers. Controllers map internal `ServiceOutcome` values into `ServiceResponse` and Zod-parse with `serviceResponseSchema` before returning. Derive public types from schemas with `z.infer`.
- Application outcomes use HTTP 200 with the response body for each of the three statuses. Expected validation and permission denials must return `failed`, rather than throw to the client. Authentication, malformed requests, infrastructure failures, and network failures can arise before a controller runs or after a response is sent: define the boundary adapters and a client fallback explicitly, without claiming an envelope can cover unavailable transport.
- UI uses `message` for success, warning, and error toasts. Boundaries render success content or empty state, failed inline/form errors, or error with retry. Content components can assume successful data. Map failed outcomes to warning styling and system errors to error styling.
- Audit maps permission denial to `denied` and response `failed`, and system faults to `error`; apply access control and route-error conventions consistently.

```text
Service (ServiceOutcome) → Controller (map + schema parse)
  → Transport → Hook/loader → Boundary/component
```

## Adoption and verification

1. Finish open design decisions and get explicit approval; inventory actual operations and existing uncommitted work first.
2. Apply the approved pattern to activity as the pilot. Keep existing routes, exports, behavior, authorization, and cache boundaries compatible; define a migration path before changing wire shapes.
3. Update documentation, imports, tests, and Scalar/OpenAPI. Verify anonymous/authenticated access, origin protection, user scoping, legacy compatibility, response serialization, hooks and query invalidation.
4. Run `pnpm test`, `pnpm check`, direct module and affected app typechecks, and relevant builds and browser checks.
5. Adapt other modules incrementally to their actual capabilities; do not bulk-move or add unused layers.

## Open decisions

- [ ] Full client domain and component layout, shared client placement, and app-wide API composition.
- [ ] Shared protected procedure/request context and legacy HTTP adapter placement.
- [ ] Trusted `system` input design and optionality of input groups.
- [ ] Specify exact ServiceOutcome, field errors and safe system error detail; define handling for failures outside an application response and React Query mutation callbacks.
- [ ] Wire-contract migration/versioning and compatibility policy.
- [ ] Whether utilities remain grouped by technical type or by domain.
- [ ] Security-specific Better Auth database hooks, database helper, and full operation inventory.
- [ ] Review and approve this standard before implementation.

Activity, location, sessions, and connected-accounts have been extracted into standalone modules; security still provides shared compatibility infrastructure. The shared response contract, full server layering, operation-specific hooks, and compatibility migration remain to be implemented and verified.
