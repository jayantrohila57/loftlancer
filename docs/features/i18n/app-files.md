# App files

Under **`apps/<name>/src/shared/i18n/`** only — **MUST NOT** `src/i18n/`, `index.ts`, re-export shims.

```text
messages/<slug>.<locale>.json   # e.g. web.en-us.json, web.en-in.json
<slug>.i18n.ts          # defineAppI18n, appI18n, i18nConfig
<slug>.i18n.cache.ts    # "use cache" message loaders (Cache Components)
<slug>.i18n.server.ts   # getServerTranslations, initRequestI18n, generateLangStaticParams
<slug>.i18n.client.ts   # useClientTranslations only — no JSX
```

- **`<slug>.`** on filenames; generic export names (`appI18n`, not `webI18n`).
- **`<slug>.i18n.server.ts`:** `import "server-only"`; wire `createSegmentI18nTools` from `@features/i18n/server`.
- **`<slug>.i18n.cache.ts`:** top-level `"use cache"`; `cacheTag` per app + locale.
- **`global.d.ts`:** augment `next-intl` Locale, Messages, and Formats from `<slug>.i18n.ts`.
- **Enforcement and format presets:** [enforcement.md](./enforcement.md).
- Switcher wrapper: `src/components/<slug>.language-switcher.tsx` → `@features/i18n/locale-switcher`.

**Next:** [proxy-next.md](./proxy-next.md)
