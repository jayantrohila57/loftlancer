# Apps — new app checklist

**Previous:** [package-json-and-tsconfig.md](./package-json-and-tsconfig.md)

Setup order: [../workflow/02-setup-order.md](../workflow/02-setup-order.md).

1. Copy baseline from `web` or `auth`, or scaffold using [tree.md](./tree.md).
2. Unique **`dev`** port if multiple apps run locally. **Auth:** port **3002**, `basePath` **`/auth`** — open `http://localhost:3002/auth` ([auth/README.md](../auth/README.md)).
3. Workspace deps + `transpilePackages` + root tsconfig reference — see [package-json-and-tsconfig.md](./package-json-and-tsconfig.md).
4. `pnpm install`, [../verify/commands.md](../verify/commands.md), `pnpm build --filter <name>`.
5. `next.config.ts`: `cacheComponents: true`, `partialPrefetching: true` — [cache-components.md](./cache-components.md).
