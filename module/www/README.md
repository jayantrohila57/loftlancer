# Public website module

Owns the public marketing, legal, status, changelog, sign-in, and route-state pages served by `apps/www`. Parent issue: #1090; current sub-issue: #1091.

**Platform rules:** [modules](../../docs/modules.md) · [naming](../../docs/naming.md) · [rendering](../../docs/rendering.md)

## Boundaries

- `apps/www/src/app/**` keeps Next.js route files, the root HTML layout, global CSS entry, and static assets. Route content and metadata come from this module.
- `module/www/client/www/rsc/` contains server-first route and page composition; focused browser interactions live in `components/` and `utils/` client files.
- Public header and footer use reusable components in `module/shared/layout/`; this sub-issue composes them only for `www`.
- Generic presentation primitives remain in `features/marketing`; public copy, route metadata, and site navigation belong here.

## Directory map

```text
client/www/rsc/          Server-first route pages and page composition
client/www/components/   Public UI and narrow client interactions
client/www/layout/       www composition of reusable shared header/footer
client/www/sections/     Standalone sections grouped by page
server/page/             Changelog source loading
utils/                   Metadata, route, and site configuration helpers
```

Keep `apps/www/src/app/**` route files as exports from this module. The Next root layout, global CSS, static assets, and consent-gated Next analytics provider remain app integration points.

## Verification

```bash
pnpm --filter www check-types
pnpm audit:module-architecture
pnpm audit:architecture-layers
```

## Sub-issues (parent #1090)

| Sub-issue | Scope                                                 | Status      |
| --------- | ----------------------------------------------------- | ----------- |
| #1091     | Move www page sections and shared chrome into modules | In progress |

## TODO (blocked)

None.
