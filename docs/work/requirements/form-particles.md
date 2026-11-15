# Form particle implementation phases

**Status:** In progress  
**Requested:** Implement Coss form particles one field category at a time, adapting their source to the form kit; use separate preview pages and compare rendered results with the original particles.

## Scope and rules

- Features own reusable form controls and their form-state integration; profile module owns local previews; auth routes only export module screens.
- Use the actual Coss particle source and existing `@packages/ui` primitives. Record particle IDs and adaptations. Maintain the kit's schema validation, reset, labels, disabled/read-only/loading, accessibility and default styling where applicable.
- Implement and verify each category before beginning the next. Use no automated test files, per the user's prior instruction; check behavior and appearance in the browser and run `pnpm check`.
- Form, field, fieldset, label, input group, button and group are composition primitives or states, not separate field values. Validation, error, disabled, loading, async, search, time, timezone and Zod are cross-cutting behavior or filters, not automatic field types. Implement the relevant particles in their owning category and note unsupported integrations.
- Keep preview routes locale-aware and navigation accessible. Samples do not persist or call external services.

## Phases

1. **OTP field** — basic, large, separator, label, sanitization, validation, alphanumeric, hints and masking where the upstream particle and current primitive support them; preview and verify.
2. **Input and input group** — audit existing text, email, telephone, URL, search and password against each relevant upstream particle; add missing independent variants.
3. **Textarea** — basic, counter and applicable field states.
4. **Number field** — basic, steps, range, formatting and currency.
5. **Select** — basic, grouped, option-rich and applicable states.
6. **Combobox**, including multi-select and searchable variants.
7. **Autocomplete**, including async and searchable variants.
8. **Checkbox**, then **checkbox group**.
9. **Radio group**, including theme cards.
10. **Switch**.
11. **Slider**, including range and input variants.
12. **Toggle**, then **toggle group** and **segmented control**.
13. **Calendar**, then **date picker**, including range and date/time variants.
14. **Form composition** — field, fieldset, label, button, group and cross-cutting state particles; final coverage review and preview navigation.

Record per-particle coverage, visual and behavior evidence as each phase is finished. Third-party dependent particles require separately identifying their integration requirements; do not claim support based only on a similar-looking field.

## Current evidence

- OTP field implemented with basic, large, separator, label, alphanumeric, hints, mask, custom normalization and validation-on-completion examples at `/auth/[lang]/test-otp`. Sources: Coss `p-otp-field-1`, `2`, `3`, `5`, `6`, `7`, `8`, `9`, `10`. Field context and Zod validation are adapted to the existing kit.
- Browser comparison: inspected basic and large upstream particles and the local preview; inspected the other local variants, submitted empty fields, entered a complete code, checked auto-validation, normalization, rejected-character feedback, and reset. `pnpm check` passes with an existing form hook lint warning.
- Remaining in this phase: compare every remaining variant visually with its upstream particle; auto-validation does not yet show the particle's success message. Do not mark this phase complete until those behaviors are addressed and checked.
- Later phases are not yet implemented or audited. Existing profile preview: `/auth/[lang]/test-profile`.

- Select phase started early at the user's request. Added single, grouped and multiple select using `p-select-1`, `2`, `3`, `4`, `5`, `6`, `7`, `12` and `18`; preview at `/auth/[lang]/test-select`. Checked grouped selection, multiple deselection, disabled option rendering, required validation and reset. Compared local basic/size layouts with the gallery; visual and behavioral review of all variants remains pending.
- Select continuation: added `select-rich` using Coss icon, colored status, pill, prefix, flag, avatar and auto-width compositions, plus `select-timezone` from `p-select-13`. The rich field stores a string value even where the upstream UI particle uses an object. The timezone offset list is calculated after mount for Next.js prerender compatibility. Browser checks: selected India and reset to Canada, verified timezone rendering and checked a fresh preview had no browser errors. Other presentations have been rendered but have not all been individually interacted with or visually compared.
- Select continuation: added `select-object` based on Coss `p-select-10`, preserving the selected object in form state, and the `p-select-24` color swatch composition. Browser verification selected Vite, submitted its label and description, and reset to Next.js. Comprehensive visual and behavioral checks of all Select variants remain pending.
- Combobox phase started: `p-combobox-1`, `p-combobox-7` and `p-combobox-9` adapted as `combobox` and `combobox-multiple`, with a preview at `/auth/[lang]/test-combobox`. Checked filtering, selection, clear, chip removal, required validation, and reset. Compared the rendered basic/clear/chips compositions with the Coss gallery. Grouped, async, timezone, input-in-popup and other Combobox particles remain pending; later field phases are not complete.

- Autocomplete phase started: `p-autocomplete-1`, `2`, `3`, `4`, `7`, `8` and `9` adapted to `type="autocomplete"`, with a preview at `/auth/[lang]/test-autocomplete`. Compared basic/disabled appearance with the upstream gallery. Checked suggestion filtering and selection, free-form submission, clear, required validation and reset. Grouped, limited, async, autofill and address integrations remain pending; Combobox and other field phases are also incomplete.

- Checkbox phase started: Coss basic, description, card and form patterns plus checkbox groups with disabled options and parent select-all are available at `/auth/[lang]/test-checkbox`. Checked required errors, selection, submission, reset, select-all and the mixed state. Nested checkbox groups remain pending.
- Radio group phase started: basic, disabled, descriptions and card-style Coss patterns are available at `/auth/[lang]/test-radio`; checked required validation, selection, submission and reset. Theme cards already have a separate field. Other radio/segmented variants remain pending.

### Additional controls in progress

The form dispatcher now includes switch (including card), toggle, multiple toggle group, segmented radio control, single and range sliders, and a single-date picker. They are shown at `/auth/en-us/test-controls`. These use the shared Coss UI primitives. Date ranges, multiple dates, inline calendars, date/time combinations, and the remaining gallery variants still require implementation and visual comparison; this is not a complete particle audit.

The temporary form preview routes and screens mentioned above have since been removed. The checks described are historical.
