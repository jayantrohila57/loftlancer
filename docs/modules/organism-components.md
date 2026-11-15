# Modules — organism & client-leaf UI

**Prev:** [ui-tree.md](./ui-tree.md) · **Example:** `@modules/auth` sign-in under `src/screens/sign-in/`

Normative rules for **module screens** (organisms) and the **client leaves** they compose. Applies to all `@modules/<slug>/src/screens/**`.

## Roles

| Piece                 | Responsibility                                             | Server / client                 |
| --------------------- | ---------------------------------------------------------- | ------------------------------- |
| **Screen (organism)** | Shell, title, layout, `next/dynamic` boundaries            | Server when possible            |
| **Client leaf**       | One user action or one state machine (OAuth, submit, etc.) | `"use client"`                  |
| **Hook**              | Locale, paths, API calls, toast orchestration              | `"use client"` in `src/hooks/`  |
| **Context**           | Share form state across sibling leaves only                | `"use client"`; narrow provider |

Organisms **MUST NOT** own child fetch/state for leaves (see [ui-tree.md](./ui-tree.md)). Apps **MUST** re-export screens from routes without wiring props ([page-convention.md](../apps/page-convention.md)).

## No prop drilling

**MUST NOT** pass through the tree for convenience:

- Locale, `basePath`, or route segments (`locale`, `lang`, callback paths)
- Event handlers (`onClick`, `onSubmit`) from parent to presentational child
- Form state (`value`, `pending`, `error`, `message`) between sibling leaves

**MUST** use instead:

- **`useAuthLocale`-style hooks** — read `[lang]` / `next-intl` in the leaf or hook (`src/hooks/*`).
- **App URL helpers** — derive paths from `NEXT_PUBLIC_*` (e.g. auth app base path from `NEXT_PUBLIC_AUTH_APP_URL`), not hard-coded `/en-us/...` without base path.
- **Context + hook** — provider calls the hook once; atoms call `useContext` with **zero props** (magic-link field, submit, etc.).

Splitting into many files **MUST NOT** reintroduce drilling (dumb button + parent `onClick` is still drilling).

## One job per leaf — self-contained

Each client leaf **MUST** be usable as `<Leaf />` with **no props** (except rare framework types).

- **Social sign-in:** one file = icon + `Button` + hook + toast (not `Button({ onClick })` + orchestrator).
- **Submit control:** reads shared state from context; includes icon + `loading` on `Button`.

Prefer **hook + small UI files** over **props + presentational atoms**.

## `@packages/ui` (Coss / shadcn)

**MUST** use design-system components from `@packages/ui/components/*`:

| UI                   | Use                                                             | Avoid                                                                        |
| -------------------- | --------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Actions              | `Button` with `loading={pending}` (built-in spinner + disabled) | Manual `disabled` + `data-loading` only                                      |
| Forms and fields     | `FormKit` for forms; `FieldKit` for standalone fields           | Direct UI primitives or raw controls; see [form policy](../features/form.md) |
| Feedback             | `toastManager.promise` + app `ToastProvider`                    | Inline `<p role="alert">` for API errors                                     |
| Loading placeholders | `Skeleton` sized from layout tokens                             | Arbitrary `h-[…]` guesses                                                    |

Icons on primary actions **SHOULD** match social/action patterns (brand or semantic SVG in `src/icons/`).

Reference: [../packages/ui/coss-ui.md](../packages/ui/coss-ui.md).

## Async & errors

- Wrap client mutations in **`toastManager.promise`** with loading / success / error copy.
- **`catch`** after `toastManager.promise` when the toast already shows the failure — avoids Next.js dev runtime overlay on expected errors.
- Map API errors to **actionable** copy (status/code when `message` is empty). Keep formatters in `src/domain/` or shared module utils.

## Dynamic import (Next.js)

Client leaves **SHOULD** be loaded from the **server screen** with:

```tsx
const Leaf = dynamic(
  () => import("./leaf.client").then((m) => ({ default: m.Leaf })),
  {
    loading: () => <LeafSkeleton />,
    ssr: false,
  }
)
```

- **`ssr: false`** for browser-only leaves (auth client, toasts, `window.location`).
- **Skeleton** **MUST** mirror final layout (gaps, heights). Share classes in a colocated **` *-layout.ts`** (tokens only, no `"use client"`) used by both skeleton and live UI.
- **`modules/<slug>/tsconfig.json`:** map `next/dynamic` to the consuming app’s Next types (e.g. `../../apps/<app>/node_modules/next/dynamic.d.ts`) so the IDE typechecks the module project.

## TypeScript & wiring

- Map `@packages/ui/components/*` and `@packages/t3-env/client` in **`modules/<slug>/tsconfig.json`** when leaves import them.
- Apps include `../../modules/<slug>/src/**/*` in `tsconfig` and re-export pages as `export default Screen` with **no** `params` props into screens.

See [wiring.md](./wiring.md), [../apps/package-json-and-tsconfig.md](../apps/package-json-and-tsconfig.md).

## Checklist (new screen)

1. Server screen composes shell + dynamic client leaves only.
2. No locale/path/error props from app routes.
3. Hooks/context own data; leaves have no props.
4. `FormKit` / `FieldKit` for forms and fields; Coss `Button` / toasts; icons on actions.
5. Dynamic + `ssr: false` + measured skeletons.
6. Module `tsconfig` paths for `next/dynamic` and UI imports.
7. `pnpm check` from repo root.

**Next:** [api-structure.md](./api-structure.md)

For asynchronous user-initiated mutations, show a pending spinner in the action icon and use a promise toast for the same operation, with accurate success and error messages. Disable repeated submission while pending and keep confirmation dialogs open on failure. Redirecting to an external provider is not itself proof that an account was connected.
