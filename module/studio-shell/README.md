# Studio shell (`module/studio-shell/`)

**Tier 1** layout for Studio: sidebar, header, inset. Apps import **`@module/studio-shell/...`** only — no duplicate shell in `apps/studio/src/components/layout`.

See [docs/layouts.md](../docs/layouts.md) and [docs/gaps/layouts-routes.md](../docs/gaps/layouts-routes.md).

Scaffold client exports (`StudioShellLayout`, etc.) when the rewrite lands.

## Utils moved from transport

| File                               | Notes                                                                                      |
| ---------------------------------- | ------------------------------------------------------------------------------------------ |
| `utils/utils.sidebar-favorites.ts` | Favorite pin limit helpers; `@loftlancer/orpc/sidebar-favorites` is a deprecated re-export |

## TODO (blocked)

| Item                          | Blocked on            | Notes               |
| ----------------------------- | --------------------- | ------------------- |
| Shell client layout migration | Studio layout rewrite | See docs/layouts.md |
