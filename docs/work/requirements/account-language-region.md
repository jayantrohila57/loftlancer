# Requirements: Account language and region

**Status:** Implementing  
**Approved by:** User, 2026-11-09  
**Layers:** packages / features / modules / apps

## Goal

Complete the six authenticated Language & Region account pages using the shared form kit. Save each person's choices and make supported preferences effective wherever the applications present localized information.

## Current state

- Auth has guarded settings forms for language, region, date and time, currency, numbers, and measurements, plus a section overview.
- All four applications support `en-us`, `en-in`, and `es-es` in locale-prefixed URLs. The existing locale switcher preserves the path, query, and fragment.
- Shared formatting resolves supported saved preferences with a deterministic UTC time-zone fallback; consumer coverage across applications still needs an inventory.
- User-owned regional preferences have a separate schema and migration; deployment migration status must be verified independently.
- FormKit already supplies select, searchable combobox, and time-zone fields. Existing account modules use authenticated oRPC procedures and user-scoped services and repositories.

## Proposed scope

- [x] Replace the six placeholders with localized, accessible FormKit forms. Load saved values, show loading and error states, validate inputs, and provide save/reset feedback.
- [x] Persist preferences per authenticated user in the existing database. The server derives ownership from the session; clients cannot choose another user. Preserve existing users and data.
- [x] Language: select one of the application's supported locales. On save, use existing localized navigation and locale-cookie behavior while preserving the current route, query, and fragment. An explicit URL locale remains authoritative for the current request.
- [x] Region: store an explicit region independently of language and currency. Present localized region names; do not infer a currency from the language or region.
- [x] Date and time: select a valid IANA time zone and supported date/time display preferences. Apply the same resolved values to server and client formatting; avoid hydration mismatches.
- [x] Currency: select an explicit ISO 4217 currency for preference-based monetary displays. Never convert monetary amounts or change an amount's actual currency code; transaction-specific currency remains authoritative.
- [x] Numbers: select supported number presentation preferences using locale-aware formatting, without changing raw values or API/database formats.
- [x] Measurements: select an explicit measurement system. Apply it only where the application actually presents convertible measurements, with appropriate unit conversion and localized unit formatting; report any unsupported use cases rather than implying a setting is effective.
- [ ] Make saved preferences available across authenticated Auth, Console, Studio, and Web contexts where they are used, without breaking anonymous routes, static rendering, locale routing, SEO alternates, authentication callbacks, or existing locale switching.
- [ ] Add all user-facing strings to all three catalogs in every affected application. Preserve next-intl and Biome enforcement.

## Out of scope

- Adding languages, translation providers, geolocation, currency conversion, exchange rates, or changing stored transaction currencies.
- Reformatting API payloads, database values, or internal calculations.
- Overriding an explicit locale in a URL with an account preference.

## Proposed architecture

| Layer               | Responsibility                                                                                                                                                                                 |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@packages/drizzle` | User-owned preference schema and generated migration using the existing PostgreSQL connection.                                                                                                 |
| Domain module       | Validated preference types, authenticated oRPC procedures, user-scoped service/repository, and account-page organisms. Follow the current module boundaries and `ServiceResponse` conventions. |
| `@features/form`    | Existing FormKit fields and validation lifecycle; extend only for a reusable missing capability.                                                                                               |
| `@features/i18n`    | Locale-aware formatting and shared presets; accept resolved preferences without importing account-domain code.                                                                                 |
| Applications        | Thin guarded routes, message catalogs, and request/provider wiring.                                                                                                                            |

## End-to-end flow

1. A signed-in user opens any of the six existing account pages; signed-out access follows the current account guard.
2. The application reads that user's preferences through the existing authenticated transport and displays their saved values or explicitly documented fallbacks.
3. The user edits one page and saves. Server-side validation rejects invalid values; updates preserve unrelated preference fields and other users' data.
4. The page shows success or an actionable error. The saved selection survives reload and another authenticated session.
5. Language changes navigate with the existing locale-aware router. Formatting changes are reflected consistently in server and client output where relevant.

## Environment and integrations

Use the existing `DATABASE_URL` and Better Auth session configuration. No new external service, provider, or environment variable is proposed. Generate the migration with the existing Drizzle tooling; test it against an isolated database before applying it anywhere persistent.

## Decisions to confirm

- [x] Persist account preferences shared by the four apps, with explicit URL locale taking precedence for the current request.
- [x] Leave region, currency, and measurement preferences unset until selected; retain the existing UTC fallback for an unset time zone. The UI must distinguish unset from a saved selection.
- [x] Confirm the supported date/time and number choices and which existing screens should immediately consume each preference after inventory. Do not expose choices that have no implemented effect. See [regional-formatting-inventory.md](../regional-formatting-inventory.md).
- [x] Currency is a display preference only, never an instruction to convert a transaction amount.

## Implementation and verification after approval

1. Inventory presentation consumers, define supported choices and fallback behavior, and document any limitations. **Currency and measurement:** [currency-and-measurements.md](../../features/i18n/currency-and-measurements.md). **Done:** [regional-formatting-inventory.md](../regional-formatting-inventory.md).
2. Add and test the schema migration, validation, authenticated user-scoped reads and writes, including concurrent partial updates.
3. Implement the six FormKit pages and translated messages; connect supported preferences to request and client formatting.
4. Test invalid and unauthenticated requests, user isolation, persistence, language switching and query retention, and server/client formatting for all supported locales and time zones. Verify currency codes and numeric values remain unchanged.
5. Run `pnpm check`, relevant tests, and production builds. Browser-test each settings page, save/reload, locale switching, and error states with disposable accounts and an isolated database. Report any unavailable test environment or unsupported consumer.

## API progress

- Added user-scoped read and partial-update oRPC procedures and authenticated OpenAPI routes. The migration is generated and must be applied through the existing deployment process before the API can persist preferences.
- An isolated PostgreSQL and Auth-server check verified authentication, same-origin enforcement, OpenAPI discovery, invalid input, two-user isolation, concurrent partial updates, clearing fields, and persistence. The migration was applied separately to an isolated database.
- Six settings forms and formatting-provider integration exist. Authenticated local save/reload/reset checks covered the six forms; broader error states, cross-app consumers, and deployment verification remain open. Currency and measurements are stored, but no transaction or measurement conversion is implied.

## Validation before sign-off

- [x] Existing routes, supported locales, form kit, database, and formatting fallback inspected.
- [x] Required schema change, user ownership, migration, and all affected layers identified.
- [x] User approved proceeding with the draft; identify supported presentation consumers during implementation.
