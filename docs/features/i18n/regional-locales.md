# Regional locales

URLs use **full locale tags** (lowercase, hyphen), e.g. `en-us`, `en-in`, `es-es` — not bare `en` / `es`.

| Item           | Location                                                                                                                                                |
| -------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Default list   | `defaultSupportedLocales` in [`../src/constants/i18n.constants.ts`](../src/constants/i18n.constants.ts)                                                 |
| Default locale | `en-us`                                                                                                                                                 |
| URL prefix     | `localePrefix: "always"` — **every** locale appears in the path (`/en-us`, `/en-in`, …). Use `"as-needed"` only if you want to hide the default locale. |
| Messages       | `messages/<slug>.<locale>.json` (e.g. `web.en-in.json`)                                                                                                 |
| Proxy matcher  | Literal `/(en-us\|en-in\|es-es)/:path*` — sync when locales change                                                                                      |
| Labels / flags | `defaultLocaleLabels`; flags from region subtag (`en-in` → 🇮🇳)                                                                                          |

**Web:** `/en-us`, `/en-in`, `/es-es`  
**Auth** (`basePath`): `/auth/en-us`, `/auth/en-in`, `/auth/es-es`

Per-app overrides: `defineAppI18n({ config: { locales: [...], localePrefix: "..." } })`.

**Next:** [layout.md](./layout.md)
