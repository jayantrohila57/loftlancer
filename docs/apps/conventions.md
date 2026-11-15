# Apps — conventions

**Prev:** [tree.md](./tree.md) · **Next:** [package-json-and-tsconfig.md](./package-json-and-tsconfig.md)

## Imports

`@/`, `@features/*`, `@packages/*`, `@modules/*` only under `src/` (incl. `global.d.ts`, `proxy.ts`).

## Types

`src/shared/types/<slug>.app.types.ts` — no inline route prop types.

## Shared files

`<slug>.` prefix under `src/shared/`.

## Proxy / Next

`src/proxy.ts` (not `middleware.ts`). `transpilePackages`: workspace packages only, not `@modules/*`.

**Cache Components:** `cacheComponents: true` and `partialPrefetching: true` in `next.config.ts` — see [cache-components.md](./cache-components.md).

Capability-specific proxy/plugin rules → that feature’s **`features/<slug>/AGENTS.md`**.

## UI

`@packages/ui/globals.css` once in layout; shadcn target `packages/ui`.

## Quality

Smallest diff; compose features in layouts.
