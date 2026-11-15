# Apps — Cache Components (PPR)

**Prev:** [app-shared.md](./app-shared.md)

Next.js **16** — enable in `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  // ...
}
```

Partial Prerendering is **on** with Cache Components (no `experimental.ppr`).

## Roles

| Layer            | Responsibility                                                               |
| ---------------- | ---------------------------------------------------------------------------- |
| `apps/`          | Route tree, gates, re-exports; **Suspense** only when app-specific           |
| `modules/`       | `'use cache'` on shared reads; **Suspense** per dynamic block; client leaves |
| `@features/i18n` | Cached message bundles; `[lang]` layout + segment `params`                   |

## Rules (match [../modules/ui-tree.md](../modules/ui-tree.md))

1. **Cached reads** — `'use cache'` on module services / static UI slices; **`cacheTag`** / **`cacheLife`** for revalidation.
2. **Per-request data** — `cookies()`, session, personalized nav: async server component inside **`<Suspense fallback={skeleton}>`**.
3. **Do not** read uncached data in a layout/page **without** cache or Suspense (build fails under `cacheComponents`).
4. **Client leaves** — React Query + `next/dynamic` skeletons; server shell still PPR-friendly.

## i18n

- **`initRequestI18n(params)`** from `<slug>.i18n.server.ts` — `[lang]/layout.tsx` renders `<html>` and providers after locale and messages resolve.
- **`getServerTranslations(params, namespace)`** — pass route **`params`**; messages from **`*.i18n.cache.ts`**.

See [../features/i18n/layout.md](../features/i18n/layout.md).

## Pages

Prefer **`export default`** from `@modules/*`. Until migrated, demo pages use typed **`LangPageProps`** and segment translations.

**Next:** [../modules/ui-tree.md](../modules/ui-tree.md) (rendering detail)
