# Internationalization enforcement

All enforcement is blocking. Application text, common controls, account navigation,
metadata, and presentation date/number calls use the locale catalogs and next-intl.
There is no baseline or warning-only mode.

## App architecture audit

| App     | Routing        | App-owned navigation and request entry         | Messages                |
| ------- | -------------- | ---------------------------------------------- | ----------------------- |
| Auth    | `/auth/[lang]` | `apps/auth/src/shared/i18n/auth.i18n.ts`       | `auth.<locale>.json`    |
| Console | `/[lang]`      | `apps/console/src/shared/i18n/console.i18n.ts` | `console.<locale>.json` |
| Studio  | `/[lang]`      | `apps/studio/src/shared/i18n/studio.i18n.ts`   | `studio.<locale>.json`  |
| Web     | `/[lang]`      | `apps/web/src/shared/i18n/web.i18n.ts`         | `web.<locale>.json`     |

Every app uses `en-us`, `en-in`, and `es-es`, with the default `en-us` and
`localePrefix: "always"`. Each app wires `createI18nNextPluginForApp`, a proxy with
literal matchers, cached per-locale catalogs, `createSegmentI18nTools`, and
`I18nProvider` in its `[lang]` layout. Each app's `defineAppI18n` bundle delegates
to the single `createNavigation` factory in `@features/i18n`.

Each `global.d.ts` augments `next-intl.AppConfig.Locale`, `Messages`, and `Formats`.
Locale comes from the same literal locale tuple supplied to app configuration;
messages come from that app's English catalog; formats come from the shared preset
object. Each app's `i18n.type-test.ts` is compiled separately by its existing
typecheck and verifies valid and invalid locales, message keys, and format names.
URL params remain untrusted strings until the segment resolver validates them.

## Navigation and JSX

Biome **2.6.4** is pinned in the root manifest and lockfile. Existing rules and
overrides are retained. `style/noRestrictedImports` and `style/noJsxLiterals` run
at error severity.

In the four localized apps, import `Link`, `useRouter`, `usePathname`, and
`redirect` from `@/shared/i18n/<app>.i18n`. Raw `next/link`, `next/router`, and those
three named `next/navigation` imports are forbidden. Namespace/star navigation
imports are also forbidden because they bypass the named restrictions in Biome
2.6.4. Use named imports for the other Next.js APIs: `notFound`, `useSearchParams`,
`useParams`, selected layout segment hooks, `RedirectType`, `permanentRedirect`,
`forbidden`, and `unauthorized` remain available.

Shared modules/features have the same restrictions and receive app navigation
through the existing shell bindings instead of importing app aliases. Only
`features/i18n/src/capability/i18n.navigation.ts` can import `next-intl/navigation`
within the app/feature/module layers. Low-level `packages/` SDKs keep their existing
import policy. Biome's JSX rule checks JSX text with its standard options; it is
not a complete extraction or translation-key validator.

## Shared formatting

`features/i18n/src/config/i18n.formats.ts` is exported from `@features/i18n`.
Request configuration and the client provider both receive the same formats.
The deterministic time zone fallback is `UTC`; the provider can accept a user's
IANA time zone. Currency is always explicit and never inferred from locale.
Account **preferred currency** and **measurement system** must not silently convert
stored values; see [currency and measurements](./currency-and-measurements.md).

| API from `useFormatter()` / `getFormatter()` | Presets                                                                |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `dateTime`, `dateTimeRange`                  | `short`, `shortDate`, `longDate`, `time`, `dateTime`                   |
| `number`                                     | `decimal`, `integer`, `percent`, `usd`, `inr`, `eur`                   |
| `list`                                       | `conjunction`, `disjunction`                                           |
| `displayName`                                | `language`, `region`                                                   |
| `relativeTime`                               | Pass `i18nRelativeTimeFormats.long`, `.short`, or `.narrow` as options |

For example, `format.number(amount, "inr")` uses the active locale's currency
formatting. Percent values are ratios (`0.25` becomes 25 percent).
`format.displayName("IN", "region")` localizes a region's name. Relative times
use `format.relativeTime(date, {...i18nRelativeTimeFormats.short, now})`; next-intl
does not support named global relative-time formats. Supply a stable `now` when
the same relative value is rendered on both server and client.

The provider defaults apply to the documented `@features/i18n/provider` entry.
The older root `I18nClientProvider` alias is unchanged; all four apps use the
documented entry.

## Formatting validation scope

`scripts/i18n/check.mjs` uses TypeScript's AST, with no extra lint dependency or
GritQL plugin. It checks:

- `toLocaleString`, `toLocaleDateString`, and `toLocaleTimeString` member uses.
- `Intl.NumberFormat` and `Intl.DateTimeFormat`, including static bracket access,
  global object access, constructor references, destructuring, and local aliases
  of `Intl`.
- Unicode currency symbols in string/template literals, JSX text, and content
  attributes, including Unicode escapes and numeric/named JSX currency entities.

Presentation scope includes all TSX/JSX under each layer's `src`, JS/TS helpers in
`client`, `screens`, `components`, `hooks`, `views`, `presentation`, and
`formatters`, app route presentation files, app shared shell/formatters/presentation,
and helpers named `*.client.ts`, `*.format.ts`, `*.formatter.ts`, or `*.display.ts`
(including JavaScript and module extension equivalents).

Tests, stories, fixtures, declarations, API directories, and `route.ts` handlers
are excluded. Other server/services/schema/config/general utility files are
outside presentation scope. Internal offset parsing in
`features/form/src/utils/form.timezones.ts`, for example, remains allowed.
Comments, types, regex literals, imports, property keys, and technical JSX
attributes such as `className` and `href` are not currency content. Arithmetic,
date parsing, `toISOString`, persistence, and calculations remain available.

This is a syntactic, path-scoped policy, not whole-program data-flow analysis.
Put extracted display helpers in presentation paths or use a formatting filename
so the policy continues to cover them. Do not move display logic to server or
general utility paths to bypass validation. Locale previews use next-intl formatters and have no blanket infrastructure exemption.

## Checks and CI

- `pnpm check:i18n`: presentation formatting violations with file/line diagnostics.
- `pnpm lint`: existing Biome checks followed by presentation validation.
- `pnpm check`: formatting, lint, and workspace typechecking.
- `pnpm check:ci`: `biome ci`, presentation validation, and workspace typechecking.
  `.github/workflows/check.yml` runs this on pushes and pull requests with a frozen lockfile.

All commands exit nonzero on violations. Combined commands stop at the first
failure; run the individual commands for a complete inventory. All four apps pass these checks after the application migration.

Cross-app authentication destinations use `redirectToExternalDestination` in the
i18n navigation infrastructure. It accepts absolute HTTP(S) URLs without credentials
and preserves callback origins, app base paths, query strings, and locale segments.
App-owned internal redirects use the localized `redirect({href, locale})` wrapper.
Locale switching retains the current query string and fragment.

Account navigation factories receive a typed translator at render time, avoiding
global locale state. Shared UI and form controls require the existing app
`I18nProvider`. All apps load the same shared UI keys in every supported catalog.
Server request configuration uses UTC unless an explicit time zone is supplied.
The Auth account client provider applies the saved account time zone; if unset,
it uses the browser's detected zone after hydration, then UTC as a fallback.
Other application providers and server formatters do not yet read account
preferences. See [regional data and defaults](./regional-data.md).

References: [next-intl formats](https://next-intl.dev/docs/usage/configuration#formats),
[TypeScript augmentation](https://next-intl.dev/docs/workflows/typescript),
[Biome restricted imports](https://biomejs.dev/linter/rules/no-restricted-imports/).
