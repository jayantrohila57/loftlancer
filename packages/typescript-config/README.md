# `@packages/typescript-config`

Shared TypeScript presets for the monorepo. Consumers extend:

- `@packages/typescript-config/base.json`
- `@packages/typescript-config/nextjs.json`
- `@packages/typescript-config/react-library.json`

## Type safety policy (repo-wide)

All TypeScript under `apps/`, `features/`, `modules/`, and `packages/` **MUST** follow:

| Rule                                                                  | Enforcement                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`strict: true`** (includes **`noImplicitAny`**)                     | Shared `base.json`                                                                                                                                                                                                                                                                                                                                                                                |
| **No explicit `any`**                                                 | Biome `suspicious/noExplicitAny` → **error** (root `biome.json`)                                                                                                                                                                                                                                                                                                                                  |
| **No `@ts-ignore` / `@ts-expect-error` to bypass typing**             | Avoid; fix types or use narrow `unknown` + validation                                                                                                                                                                                                                                                                                                                                             |
| **Prefer `unknown` + type guards** over `any` when shape is uncertain | Code review + agents                                                                                                                                                                                                                                                                                                                                                                              |
| **Named props types**                                                 | **MUST** use a dedicated `interface` or `type` for component, page, and layout props (including Next.js `params` / `searchParams` shapes). **MUST NOT** inline object types on the function signature. In **apps**, one file **`src/shared/types/<slug>.app.types.ts`**; import **`@/shared/types/<slug>.app.types`**. In libraries, co-locate **`*.types.ts`** with the module when non-trivial. |

**MUST NOT** add `: any`, `as any`, or generic `any` in application or library code. Use proper types, `satisfies`, generics, or `unknown` with narrowing (Zod, `typeof`, etc.).

Layer routers **MUST** treat this policy as normative — [../AGENTS.md](../AGENTS.md).

## `@packages/ui` imports (TypeScript)

**MUST** resolve `@packages/ui/...` through the package **`exports`** field (`pnpm` workspace link)—**MUST NOT** add tsconfig **`paths`** like `@packages/ui/*` → `packages/ui/src/*` in apps or features. That alias points at the wrong tree (`src/components` vs `src/integration/components`) and can make the language service type-check UI `.tsx` without **`jsx`**, producing _“`--jsx` is not set”_ on imports such as `@packages/ui/components/popover`.

Inside **`packages/ui` only**, **`paths`** **MAY** map `@packages/ui/components/*` and `@packages/ui/lib/*` to integration paths for local sources. React libraries **MUST** set **`"jsx": "react-jsx"`** (included via `react-library.json`; repeat in the package tsconfig if the IDE still warns).
