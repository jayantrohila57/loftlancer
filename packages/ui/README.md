# `@loftlancer/ui` — design-system package (naming exception)

**Exception to “packages named after third-party libraries.”** This package is the Loftlancer **design system**: shadcn CLI (`new-york`) + **`@coss`** registry (Base UI), not a single vendor SDK wrapper.

| Provider                        | Role                                                      |
| ------------------------------- | --------------------------------------------------------- |
| [shadcn](https://ui.shadcn.com) | CLI, `components.json`, `components/ui/*` install path    |
| [coss](https://coss.com/ui)     | `@coss` registry in `components.json`; Base UI primitives |
| `@base-ui/react`                | Runtime primitives under the hood                         |

Renaming to `@loftlancer/shadcn` or `@loftlancer/coss` would misrepresent the hybrid. Platform docs (`docs/packages.md`, `docs/ui-ux-skills.md`) treat **`@loftlancer/ui`** as this design-system home.

## Layout

```text
src/
  components/ui/     # shadcn/coss primitives — keep path for CLI (`aliases.ui`)
  components/        # theme-provider, icons
  lib/utils.ts       # `cn` — keep at lib/ for components.json `aliases.utils`
  styles/globals.css
components.json      # shadcn + @coss registry — do not move off package root
```

**Product UX does not live here.** Reusable patterns → **`@features/patterns`**. Data tables → **`@features/data-table`**. Dashboard shell, marketing, auth chrome → other **`features/*`** packages.

## Imports

```ts
import { Button } from "@loftlancer/ui/button";
import { cn } from "@loftlancer/ui/utils";
import { ConfirmDialog } from "@features/patterns/core/client/patterns.confirm-dialog";
```

Add components with the shadcn CLI from this package directory so files land in `src/components/ui`.

## Related

- [features/patterns/README.md](../../features/patterns/README.md)
- [features/data-table/README.md](../../features/data-table/README.md)
- [features/shell/README.md](../../features/shell/README.md)
