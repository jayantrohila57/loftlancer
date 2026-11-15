# Requirements: Form input fields

**Status:** Done  
**Approved by:** User, 2026-11-06 (“ok i tweek the plan follow it and work on it”)  
**Layers:** features and modules; auth preview route

## Goal

Expand the reusable form feature with the input variants agreed in the conversation. A caller selects a field type through `FormKit.Field` or `FieldKit.Field`; the kit renders the appropriate field with consistent state, validation feedback, accessibility, and shared Coss UI styling. Demonstrate each type in the existing profile preview.

## In scope

- [x] Put the field implementations under `features/form/src/capability/fields/input/`. Name implementation files with the required `form.` prefix, for example `form.field.input-email.tsx`; keep the public API at `@features/form`.
- [x] Support the agreed types: `text`, `email`, `tel`, `url`, `search`, `password`, `number`, `currency`.
- [x] Retain the existing `text` and `inputType` usage, select, textarea, kits, and public API compatibility unless a change is unavoidable and documented.
- [x] Use existing `@packages/ui` components and default styles. Provide sensible defaults for each field; expose only data and behavior options needed for the variants, rather than arbitrary styling overrides.
- [x] Give each applicable field consistent labels, descriptions, required/disabled/read-only/loading/hidden states, unique IDs, error messages, keyboard behavior, and form-state integration. Keep controls disabled during form submission.
- [x] Cover the behavior agreed for each type: password visibility and optional strength; search clear/loading; numeric bounds and step; currency precision.
- [x] Support relevant Zod schema validation and display errors through the existing form infrastructure. The consuming module owns domain schemas, option data, provider calls, and any server-side validation. Native constraints and field options must agree with the represented values.
- [x] Show every new type in the existing `/auth/en-us/test-form` preview using local sample values, including empty, validation and reset behavior. The preview must clearly state that values are not saved.
- [x] Document each type, its value shape, defaults, and usage in the form feature README. Run `pnpm check` after each implementation slice and verify the preview in a browser.

## Out of scope

- New routes except `/auth/en-us/test-form`, changes to authentication/authorization, database storage, uploads, external APIs, third-party providers, or production profile mutations.
- Recreating table, pagination, breadcrumb, or other surrounding Coss particle layouts as field types.
- Business-specific fields, workflows, or references to another product.
- Adding automated test files or a test runner; the user previously requested removing tests. Use existing checks and browser verification instead.

## Architecture

| Layer             | Responsibility                                                                                                   |
| ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| `@packages/ui`    | Existing Coss/Base UI primitives and theme; use package exports.                                                 |
| `@features/form`  | Generic field types, state, shared field shell, and kit dispatch. No vendor SDK initialization or product logic. |
| `modules/profile` | Preview-only schema, sample values, and demonstration composition.                                               |
| `apps/auth`       | Thin route at `/auth/[lang]/test-form`; no app-owned form logic.                                                 |

Implementation stays in `capability/`, public types in `types/`, and pure helpers in `utils/`. Respect the feature scaffold, `form.` filename prefix, named props, strict TypeScript, and the single root export. Do not move or overwrite unrelated user changes.

## End-to-end flow

1. Open the existing profile preview and inspect all field examples with their default values.
2. Change values, exercise search, visibility, and numeric controls, submit invalid values to see schema errors, and reset to defaults.
3. Submit valid preview data to get the existing local confirmation; no data leaves the browser.

## Environment, integrations, and authorization

- No new environment variables, database migrations, plugins, remote integrations, or roles are required.
- The existing local preview remains unauthenticated as currently configured; no authorization policy changes are included.
- Prefer existing dependencies and UI primitives. If an agreed field cannot be implemented with them, document the specific dependency and seek the required approval before adding it.

## Implementation slices

1. Organize input fields; add text, email, telephone, URL, search, and password; wire both kits and preview. Run `pnpm check`.
2. Add number and currency; update the preview and documentation. Run `pnpm check`.
3. Verify every type's rendering and representative interaction, validation, reset, and responsive behavior in the existing browser preview. Record limitations without claiming unverified behavior.

## Gaps / open questions

No blocking product choices identified. Exact component API details will follow the existing Base UI primitives and the constraints above.

## Validation checklist

- [x] Layers and existing preview route named.
- [x] Environment, external integrations, persistence, and authorization scope specified.
- [x] All eight approved input types listed.
- [x] Existing no-tests preference recorded.
- [x] User confirms this requirements document.

## Verification evidence

- `pnpm check` passed after each slice and after the final changes; Biome reports the pre-existing `form.form-kit.tsx` hook dependency warning.
- Browser preview at `/auth/en-us/test-form` rendered all eight input types. Verified search clear, password visibility/feedback, numeric and currency increment, required/email/URL/password validation, reset, and the local submission confirmation.
- A narrow browser viewport reported no horizontal document overflow. This is a layout smoke check, not a comprehensive accessibility or cross-browser audit.
- No automated tests were added, in accordance with the user's request.

The temporary form preview routes and screens mentioned above have since been removed. The checks described are historical.
