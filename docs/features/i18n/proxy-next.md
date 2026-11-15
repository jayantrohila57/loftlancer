# Proxy and Next config

- **`next.config.ts`:** `createI18nNextPluginForApp` from `@features/i18n/plugin`; **`cacheComponents: true`** and **`partialPrefetching: true`** on apps (see [../../apps/cache-components.md](../../apps/cache-components.md)).
- **`src/proxy.ts`:** `createI18nMiddleware` from `@features/i18n`; **`config.matcher`** = **literal array** in `proxy.ts`.
- **MUST NOT** re-export `proxyConfig` from `<slug>.i18n.ts`.
- File name **`proxy.ts`** (not `middleware.ts`).

**Next:** [layout.md](./layout.md)
