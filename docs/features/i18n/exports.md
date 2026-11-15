# Exports

| Import                           | Where                                                  |
| -------------------------------- | ------------------------------------------------------ |
| `@features/i18n`                 | Server-safe only — **no** locale-switcher on `.`       |
| `@features/i18n/setup`           | `<slug>.i18n.ts` only — `defineAppI18n`                |
| `@features/i18n/server`          | **`*.i18n.server.ts` only** — `createSegmentI18nTools` |
| `@features/i18n/plugin`          | `next.config.ts` only                                  |
| `@features/i18n/locale-switcher` | Client UI — **not** via `.` barrel                     |
| `@features/i18n/provider`        | `I18nProvider` — wired in app root layouts             |

App typed hooks stay in app `*.i18n.server.ts` / `*.i18n.client.ts`.

**Next:** [app-files.md](./app-files.md)
