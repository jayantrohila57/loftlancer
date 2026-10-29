# UI and architecture requirements

The rules for feature ownership, folder and file naming, server-first rendering, typed service contracts, client leaves, route states, and incremental migration are in [docs/MODULE_ARCHITECTURE.md](./docs/MODULE_ARCHITECTURE.md). Follow that document for new and migrated modules. Existing `domain/` paths are legacy and can be migrated incrementally.

Spacing, coss UI primitives, shared patterns, and layout tokens are defined in [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md). Use the existing `@loftlancer/ui` primitives and patterns; do not edit generated UI primitives except through the documented CLI workflow. Keep application-specific shared code in `src/shared/` as it is migrated and avoid duplicate implementations.

All protected pages and mutations must enforce their server-side authentication and authorization. Keep metadata alongside routes. For UI changes, run the relevant app and verify affected routes and their loading, empty, error, forbidden, and success states in a browser as directed by [AGENTS.md](./AGENTS.md). Record any environment or authentication limitations instead of claiming an unverified result.

---

## 7. Reusability & Patterns

### 7.1 Component Design

All components must follow:

* Composition pattern
* Compound component pattern (similar to shadcn/ui)

### 7.2 Singleton Responsibility

* One component = one responsibility
* No duplicate implementations across domains

---

## 8. Styling & UI Consistency

### 8.1 UI Constraints

* **DO NOT modify `packages/ui/src/components/ui/`** (`@loftlancer/ui/<name>`) except via the documented shadcn/coss CLI workflow
* Use only coss/shadcn variants and tokens from [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) (`layout-spacing.ts`, `PageStack`, `FormSheet`, etc.)

### 8.2 Spacing Rules

* No arbitrary spacing (`p-4`, `gap-6`, …) in feature code — import layout tokens
* Sidebar-scale gutters (`p-2`, `gap-2`, `h-8` / `h-12` chrome) everywhere in app shell and pages

---

## 9. Route Protection

* Every page must:

  * Enforce authentication at the server level
  * Never rely on client-only protection
* Unauthorized access must be handled before rendering

---

## 10. Metadata

* Every page must define metadata
* Metadata must:

  * Reference site config values
  * Be colocated with the page

---
