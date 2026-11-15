# Coss UI in `@packages/ui`

Theme follows [Coss neutral colors](https://coss.com/ui/docs/styling). **Mira** component sizing (`base-mira` in `components.json`) and **`--radius: 0.45rem`** are unchanged.

## Fonts

Coss expects `--font-sans`, `--font-mono`, `--font-heading` (aliased to sans). Wired by `@features/font` on `<html>` (`Outfit`, `Geist Mono`) — not Coss Inter/Geist defaults.

## Add a component

From `packages/ui`:

```bash
pnpm dlx shadcn@latest add @coss/<name> --overwrite
```

Install the full set:

```bash
pnpm dlx shadcn@latest add @coss/ui --overwrite
```

Imports use `@packages/ui/components/*` (CLI rewrites paths). The package **`exports`** map exposes every file under `src/integration/components/`.

**Note:** `@coss/ui` replaces prior Mira shadcn copies with Coss implementations. **`--radius: 0.45rem`** in `globals.css` is still intentional.

## Base UI

Portaled UI: app layouts use `body` `relative` + inner `isolate` wrapper — see [Coss get started](https://coss.com/ui/docs/get-started).
