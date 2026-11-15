# Currency and measurement preferences

Normative policy for **preferred currency** and **measurement system** on authenticated
account settings. Applies to product copy, APIs, persistence, and any future UI that
reads `regional_preferences`.

**Related:** [regional data and defaults](./regional-data.md) ·
[requirements: account language and region](../../work/requirements/account-language-region.md) ·
[API surface](../../modules/api-structure.md)

## What these settings are

- **Preferred currency** — an explicit ISO 4217 alpha-3 code (`USD`, `INR`, …) the user
  selects for **future preference-based monetary displays**.
- **Measurement system** — one of `metric`, `us`, or `uk` for **future unit displays**
  (distance, weight, and similar quantities when the product adds them).

Both fields are nullable until the user saves a choice. `null` means **not set**; the UI
must not treat unset as an implicit default currency or measurement system in copy or
behavior (account previews may use locale-derived **example** formatting only where
documented below).

The regional preferences API validates and stores values only. It does not apply
formatting, routing, or conversion. See [api-structure.md](../../modules/api-structure.md).

## What they are not

Out of scope for this template and **must not** be introduced without an approved
requirements change:

- Exchange rates, FX conversion, or “show everything in my currency” for real balances,
  invoices, ledger rows, checkout, or payouts.
- Rewriting a transaction’s stored currency code or amount to match the user preference.
- Inferring currency from language, region, IP, or geolocation.
- Silently converting measurement values in the database, API payloads, or background jobs.
- Temperature or other unit families unless a future feature explicitly defines them.

User-facing strings in the Auth account module state this plainly (for example, currency
and measurement hints and FAQ answers in `regionalPreferences` message keys).

## Never silently convert values

This is the default engineering rule for all layers (database, API, server logic, client
presentation):

| Data                                  | Rule                                                                                                                                                                                                                  |
| ------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Monetary amounts in domain records    | Keep the **authoritative currency code and numeric amount** from the source system. Display using that code unless product requirements define an **explicit**, labeled conversion path (not implemented here).       |
| User `currency` preference            | May influence **how** optional future screens format **presentation** when product rules say to use the preference. It does **not** change stored amounts or codes.                                                   |
| Physical quantities in domain records | Store and transmit values in the **canonical unit** defined by that feature’s schema.                                                                                                                                 |
| User `measurementSystem` preference   | May influence **labels and converted display** only at a deliberate presentation boundary once a consumer exists. It does **not** change stored magnitudes without the user performing an explicit, traceable action. |

**Forbidden without explicit product approval and UX:**

- Multiplying amounts by an exchange rate “for convenience.”
- Persisting converted values back to the same field users edited.
- Showing a converted number without indicating original currency or unit when both matter.

When adding a feature that truly needs conversion, document canonical storage, conversion
source, rounding, and labeling in a requirements doc first; default remains **no
conversion**.

## Current behavior in the codebase

### Persistence and API

- Table: `regional_preferences` (`currency`, `measurement_system`), user-scoped.
- Validation: ISO 4217 / ISO 3166 lists from the checked-in `iso-codes` snapshot;
  `measurementSystem` enum in
  [`regional-preferences.schema.ts`](../../../modules/regional-preferences/src/utils/validation/regional-preferences.schema.ts).

### Consumers (inventory)

As of this document, **only** the Auth **Language & region** account module reads these
fields for UI:

- Settings forms, section overview, and live previews under
  `modules/regional-preferences/`.
- Activity metadata may record `measurementSystem` changes; it does not apply units.

**Console, Studio, Web**, server formatters, and product screens **do not** read
`currency` or `measurementSystem` yet. Saving a preference does not change formatting
outside the account settings experience.

### Currency previews (not real money)

Account UI demonstrates formatting with **fixed example numbers** (`1234.56`, `9.99`)
via `useFormatter().number` and currency style options. See
[`regional-preferences.preview.utils.ts`](../../../modules/regional-preferences/src/client/components/regional-preferences.preview.utils.ts).

- If the user has **not** set a currency, previews show **“not set”** or, on the overview
  unset row only, a **locale `usd` preset** for illustration — not a saved default.
- Choosing a currency changes **symbol and grouping** in previews only; message copy states
  that transactions keep their own currency.

Do not reuse preview helpers for real transaction or balance UI.

### Measurement previews (not real quantities)

Measurement settings show **translated sample strings** (`previewMetricSamples`,
`previewUsSamples`, `previewUkSamples`) — not converted values from live data. No
application code converts stored measurements based on `measurementSystem` today.

## Guidance for new presentation code

1. **Identify authority** — For money, use the currency on the record (invoice line,
   wallet balance, etc.). For measurements, use the unit in the API contract.
2. **Use `@features/i18n` formatters** — Follow [enforcement.md](./enforcement.md); no raw
   `Intl` or `toLocaleString` in presentation paths.
3. **Do not wire account `currency` into formatters globally** until consumer inventory
   and SSR/hydration behavior are defined (roadmap Phase 5).
4. **If display must follow the user preference**, gate on an explicit product rule and
   still avoid changing persisted values; prefer showing native currency alongside or
   clear “display only” labeling.
5. **Measurement conversion**, when implemented, belongs at the outer display layer:
   read canonical value + unit → convert for display → never write back silently.

## Unset vs saved

| Field               | Unset (`null`)                                                             | Saved                                                                        |
| ------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `currency`          | No preferred currency; no currency-based product formatting                | ISO code stored; eligible for future display-only formatting where specified |
| `measurementSystem` | No system chosen; copy may reference locale-typical units in examples only | `metric` / `us` / `uk` stored for future consumers                           |

Region and language are independent: region does **not** set currency; URL locale remains
authoritative for the current request per
[account-language-region.md](../../work/requirements/account-language-region.md).

## Verification expectations

When extending consumers, tests and manual checks should confirm:

- Saving or changing preferred currency does not alter unrelated users’ rows or any
  non-preference monetary tables.
- Numeric fields in APIs and databases are unchanged after a preference save.
- Any new UI that formats money uses the **transaction or domain currency** unless a
  documented, labeled display-only path is approved.
