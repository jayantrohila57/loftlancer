# Regional formatting — consumer inventory (Phase 5)

**Date:** 2026-11-14  
**Scope:** Inventory only — no new wiring or behavior changes.  
**Related:** [requirements/account-language-region.md](./requirements/account-language-region.md) · [auth-account-roadmap.md](./auth-account-roadmap.md) Phase 5 · [../features/i18n/regional-data.md](../features/i18n/regional-data.md)

## Summary

Account **date/time** and **number grouping** choices are **confirmed** as the supported, user-facing set. They affect **client-side** `next-intl` output on Auth **account** routes only, via `AuthAccountFormatProvider`. **Currency**, **region**, **language** (beyond URL locale), and **measurement system** are persisted and shown in Language & Region UI **previews**; they do **not** yet drive formatting outside those screens. Server rendering still uses shared defaults (`UTC`, static `i18nFormats`).

## Supported preference fields and choices

| Field               | Stored values                           | User-facing effect today                                                                                                                                     |
| ------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `timeZone`          | Valid IANA name or `null`               | **Yes (Auth account client)** — `I18nProvider` `timeZone`: saved → browser default → `UTC`                                                                   |
| `dateStyle`         | `short` \| `medium` \| `long` \| `null` | **Yes (Auth account client)** — overrides `short`, `shortDate`, `longDate`, and `dateTime` date portion when set                                             |
| `hourCycle`         | `h12` \| `h23` \| `null`                | **Yes (Auth account client)** — applied to `time` and `dateTime` presets                                                                                     |
| `numberGrouping`    | `auto` \| `never` \| `null`             | **Yes (Auth account client)** — `never` sets `useGrouping: false` on `decimal`, `integer`, and `percent` presets; unset/`auto` leave locale default grouping |
| `currency`          | ISO 4217 or `null`                      | **Preview / overview only** — no change to `usd` / `inr` / `eur` presets app-wide                                                                            |
| `region`            | ISO 3166-1 alpha-2 or `null`            | **Preview / overview only** — `displayName` uses active URL locale, not saved region                                                                         |
| `language`          | `en-us` \| `en-in` \| `es-es` or `null` | **Navigation on save** — explicit URL locale remains authoritative per request                                                                               |
| `measurementSystem` | `metric` \| `us` \| `uk` \| `null`      | **None** — no measurement conversion consumer in the repo                                                                                                    |

Schema source: `modules/regional-preferences/src/utils/validation/regional-preferences.schema.ts`.  
Shared Intl presets: `features/i18n/src/config/i18n.formats.ts`.

## Wiring: where preferences apply

| Layer                          | Behavior                                                                                                                                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Request (all apps)**         | `createGetRequestConfig` — `formats: i18nFormats`, `timeZone: defaultI18nTimeZone` (`UTC`). No account DB read.                                                                                                                                                                                        |
| **Root layout (all apps)**     | `I18nProvider` with URL locale + static formats + `UTC`.                                                                                                                                                                                                                                               |
| **Auth `(account)/account/*`** | `AuthAccountFormatProvider` re-wraps children: loads `security.regionalPreferences.get()`, merges prefs via `buildAccountRegionalFormats` / `resolveAccountRegionalTimeZone` (`apps/auth/src/shared/i18n/auth.account-regional-formats.ts`; tested in `tests/auth-account-regional-formats.test.tsx`). |
| **Console / Studio / Web**     | No account format provider — preferences **not** applied.                                                                                                                                                                                                                                              |

**Hydration note:** First paint on account routes can use SSR/UTC/static presets; after the preferences query resolves, client formatting may change. Phase 5 follow-up: “Verify SSR/client formatting, locale routing, and hydration consistency” (roadmap).

## `useFormatter` / preset consumers

All paths use shared presets from `i18nFormats` unless noted. Enforcement: [../features/i18n/enforcement.md](../features/i18n/enforcement.md).

### Auth account modules (under `AuthAccountFormatProvider`)

| Consumer                 | Location                                                                           | Presets / API                                                                          | Preferences affected                                                                                   |
| ------------------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Sessions list and detail | `modules/sessions/.../sessions.sessions.client.tsx`                                | `dateTime`                                                                             | `timeZone`, `dateStyle`, `hourCycle`                                                                   |
| Connected accounts       | `modules/connected-accounts/.../connected-accounts.connected-accounts.client.tsx`  | `dateTime`                                                                             | Same                                                                                                   |
| Activity feed and detail | `modules/activity/.../activity.unified.client.tsx`, `activity.activity.client.tsx` | `dateTime`; `number` with inline `maximumFractionDigits` / `"integer"` for coordinates | Date/time prefs; grouping on named presets used for accuracy (`integer`)                               |
| Profile — member since   | `modules/profile/.../profile.account-personal.client.tsx`                          | `longDate`                                                                             | `dateStyle` when set (all date presets aligned in provider)                                            |
| Language & Region UI     | `modules/regional-preferences/**` (overview, forms, previews, options)             | `dateTime`, `time`, `number`, `displayName`                                            | Self-demo + reads saved values; currency preview maps ISO code → `usd`/`inr`/`eur` only in this module |

### Shared features (Auth account when mounted)

| Consumer                | Location                                     | Presets                               | Preferences affected                                     |
| ----------------------- | -------------------------------------------- | ------------------------------------- | -------------------------------------------------------- |
| Date form field display | `features/form/.../form.field.date.tsx`      | `shortDate`                           | Same as account provider when field is on account routes |
| Calendar day label      | `packages/ui/.../calendar.tsx`               | `longDate`                            | Same when calendar is under account provider             |
| Locale switcher samples | `features/i18n/.../i18n.locale-switcher.tsx` | `shortDate`, `decimal`, `displayName` | Demo chips — not preference-driven                       |

### Other apps

No `useFormatter` usage in `apps/console`, `apps/studio`, or `apps/web` application code (type tests only). Formatting consumers for those apps are **future** (roadmap Phase 8).

### Tests (contracts, not product UI)

`tests/i18n-runtime.test.tsx`, `scripts/i18n/formats.test.mjs`, app `i18n.type-test.ts` files — preset coverage only.

## Confirmed decisions (Phase 5)

1. **Keep exposing** `dateStyle` (`short` | `medium` | `long`) and `numberGrouping` (`auto` | `never`) — both have a defined, implemented effect on Auth account screens listed above.
2. **Keep exposing** `timeZone` and `hourCycle` — same provider path; `timeZone` form copy already states account formatting scope.
3. **Currency** remains a stored display preference with **overview/form previews only** until a consumer maps saved ISO code to `format.number(..., preset)` or inline `currency` option (no silent conversion).
4. **Region** and **measurementSystem** remain stored with honest “not set” / preview UX; **do not** imply app-wide unit or region formatting until consumers exist.
5. **Immediate post-inventory consumers** (no new screens required): sessions, connected accounts, activity timestamps, profile member-since — already on the account provider path; verify behavior in the hydration task, not expand scope here.

## Gaps (documented, not fixed in this pass)

- No server-side `getFormatter` with account preferences.
- Currency preference does not alter `usd`/`inr`/`eur` presets in `AuthAccountFormatProvider`.
- Activity coordinate lines use inline number options; grouping preference applies only where named presets are used.
- No `relativeTime` production consumers yet (`i18nRelativeTimeFormats` reserved).
- Console, Studio, Web: no preference-aware provider.

## Follow-up roadmap items (unchanged)

- Verify SSR/client formatting and hydration (Phase 5).
- Document currency/measurement limitations in user-facing copy if needed (partially covered in regional FAQ and [regional-data.md](../features/i18n/regional-data.md)).
- Cross-app providers and Phase 8 localization completeness.
