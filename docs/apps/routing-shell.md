# Apps — routing shell

**Router:** [../AGENTS.md](../AGENTS.md)

Apps **MUST NOT** implement product UI, domain API, or business validation.

## Allowed in `src/app/`

| File kind                                     | Purpose                                                                                                           |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `layout.tsx`                                  | Providers already wired; **mandatory** gates (locale, auth shell); import **module frame** (sidebar/inset/header) |
| `page.tsx`                                    | Metadata, route params, **re-export** module page — [page-convention.md](./page-convention.md)                    |
| `loading.tsx` / `error.tsx` / `not-found.tsx` | Route boundaries only                                                                                             |
| `route.ts`                                    | Thin HTTP → module oRPC handler — no business logic                                                               |

The shared `ShellLayout` from `@features/shell` provides the sidebar, inset, and dashboard frame. Route layouts supply the app-specific navigation and continue to enforce their own access requirements.

## Forbidden in `src/app/`

- Domain forms, tables, sidebars with role logic written inline
- Prop-drilling session/data from root layout into header children
- Large `use client` trees — client lives in **modules** at leaves

## Where code lives

| Concern                                  | Layer                                  |
| ---------------------------------------- | -------------------------------------- |
| User table, user API, user validation    | `@modules/users`                       |
| Generic data table / form field patterns | `@features/*`                          |
| i18n, theme, font                        | `@features/*` + app `src/shared/i18n/` |
| Config/types used by many app routes     | [app-shared.md](./app-shared.md)       |

**Next:** [route-layouts.md](./route-layouts.md)
