# Module architecture

Use this architecture for new work and when changing existing modules. Migrate incrementally: existing `domain/`, `components/`, and `lib/` paths are legacy locations, and may remain until their owning feature is migrated. Do not create empty directories or move unrelated modules just to satisfy this structure.

## Ownership and naming

Each app owns its feature modules in `src/module/<module>/`, for example `src/module/settings/`, `src/module/organizations/`, `src/module/teams/`, and `src/module/projects/`. A module contains its own components, services, API adapters, types, hooks, and utilities as they become necessary. Follow the `arch` naming convention: `<module>.<feature>.<responsibility>.<extension>`, for example `settings.profile.view.tsx`, `settings.profile.form.tsx`, `settings.service.ts`, and `settings.types.ts`. A component should have one clear responsibility; split an independently useful component or interaction into its own file. Group closely related code when splitting would only add indirection.

Place app-specific, genuinely cross-module components, hooks, and utilities in `src/shared/`, named `shared.<purpose>.<extension>`. Use the existing `@loftlancer/ui` primitives and patterns and other shared packages for functionality shared across apps. Do not duplicate an existing reusable component. A module may consume another module through a deliberate typed public interface when needed; avoid importing another module's private implementation. Shared code must not depend on feature modules. During migration, existing shared `components/` and `lib/` code can be reused rather than copied.

## Routes, services, and data

Next.js route files stay under `src/app`: route handlers, pages, layouts, and framework state files must remain where Next.js recognizes them. A route handler is a thin adapter that delegates business logic to a service owned by its module. Do not rename public URLs or duplicate existing API contracts during a folder migration. Existing cross-app backend routers in `packages/api` remain authoritative until deliberately migrated; their authorization and audit behavior must be preserved.

Pages and layouts handle route parameters, authentication and authorization, metadata, and data fetching through typed module services, then pass the required data to imported module components. Put shared shell chrome in a parent layout; module identity, heading, and sibling navigation in the module layout; and route-specific content in the page view. Shared layouts persist on sibling navigation. Avoid fetching data in a shared layout when only one child needs it; be aware that awaited layout work can delay the shell.

## Server and client boundaries

Server Components are the default from parent to child. Fetch initial data on the server and pass only the minimum serializable values needed by a client component. Use `import "server-only"` for services that access server resources. Keep static content, layout, and read-only presentation on the server where practical. Add `"use client"` only to the smallest components that need browser APIs, event handlers, client state, or client libraries; place those interactive components at the leaves. A client provider may wrap server-rendered children through slots without converting their source into a client component. Never import a server-only module into a client graph.

Mutation endpoints and server actions must independently authenticate and authorize requests; a hidden button or a page guard is not authorization. Client state can refresh server-provided data after mutations. Do not send session secrets or unnecessary private data to the browser; if an existing operation requires a sensitive identifier, review the contract and preserve access controls.

## TypeScript and shared contracts

Keep `strict` TypeScript enabled. Use explicit domain types and inferred API or service output types instead of duplicated shapes; use `import type` for type-only imports. Avoid `any`, unchecked casts, non-null assertions, and broad serialized payloads. Validate untrusted input at API boundaries and represent loading, empty, success, forbidden, and error states explicitly. Prefer types that make invalid states difficult to express. Keep service input and output contracts separate from UI state when their responsibilities differ.

## Route states and layout stability

Provide appropriate `loading.tsx`, `error.tsx`, and `not-found.tsx` boundaries for each relevant route level; use the existing authorization flow for forbidden states and explicit empty and retry states for data. Put each boundary where it catches the intended work: an error boundary does not catch its own segment's layout, and a loading boundary does not wrap its own layout. Keep shared shell and module navigation outside the changing page content. Match skeleton geometry to final content and reserve space for images and other late content. Measure loading and cumulative layout shift with representative authenticated pages before claiming improvement; structure alone is not proof.

## Delivery

Keep work tied to an issue, preserve existing behavior and tests, and follow the repository's issue, release, and deployment workflow. For UI changes, check relevant routes and interaction states in a running app as required by `AGENTS.md`; record setup or access blockers and do not report unverified states as passed. Use the design-system tokens and shared primitives described in `docs/DESIGN_SYSTEM.md`.
