# Form

Import from `@features/form`. This capability provides `FormKit`, `FieldKit`, and eight input types (`text`, `email`, `tel`, `url`, `search`, `password`, `number`, and `currency`), plus selects, comboboxes, autocomplete, textarea, OTP, checkboxes, radio groups, switches, sliders, toggles, segmented controls and a date picker.

## Where things live

| File in `src/capability/`                 | Responsibility                                                             |
| ----------------------------------------- | -------------------------------------------------------------------------- |
| `form.form-kit.tsx`                       | Form validation, submit, errors, scroll body and action buttons            |
| `form.field-kit.tsx`                      | Field group without a form submission lifecycle                            |
| `form.errors.ts`                          | Applies server errors to the current form                                  |
| `form.fields.tsx`                         | Chooses the field type for both kits                                       |
| `fields/input/form.field.input-*.tsx`     | Input variants and their shared controls                                   |
| `fields/select/form.field.select*.tsx`    | Single, grouped and multiple select controls using the shared UI primitive |
| `fields/textarea/form.field.textarea.tsx` | Textarea with an optional character count                                  |
| `fields/radio/`                           | Radio group and theme selector                                             |
| `fields/<type>/`                          | Other field implementations grouped by control type                        |
| `form.field-shell.tsx`                    | Shared label, description, loading skeleton and error                      |

Public props live in `src/types/`. Pure error mapping lives in `src/utils/`; form-state mutations live in `src/capability/form.errors.ts`. Error focus uses the current form’s registered controls. Shared validation defaults live in `config/`; fixed messages and calling codes live in `constants/`, while reusable pure calculations live in `utils/`. Tailwind classes live directly in the components' `className` attributes.

## Fixed defaults

The kits supply shared defaults for layout, validation and actions. Individual fields expose the options described below; the field dispatcher maps each type to its implementation.

`FormKit` validates on submit and revalidates on change. It disables controls while submission runs, shows failures, and keeps entered values after success. Reset explicitly restores the initial values. Use `FormKit.Section` with a `title` and optional `description` to group fields. Put `FormKit.Actions` directly inside `FormKit` to render the fixed footer below the scroll body. The buttons are always **Submit**, **Submitting…**, and **Reset**.

Use `variant="embedded"` inside an existing container, such as an accordion, to omit the form card and its padding. The default `card` variant retains the standalone form styling.

`FieldKit` validates on change. Supply `values` for controlled state or `defaultValues` for local state. `onValuesChange` receives partial input values, matching React Hook Form’s watched state.

Fields accept content (name, label, description, placeholder, select options) and runtime state (required, disabled, hidden, readOnly, loading). Boolean state defaults to false. Text defaults to `text`; select defaults to “Select…”; textarea uses three rows and displays a character count when `maxLength` is supplied. UI primitives use their existing default sizes and variants.

## Input types

Use `FormKit.Field` or `FieldKit.Field` with a `name` and the appropriate `type`:

| Type       | Value            | Defaults and behavior                                                                                                                                                        |
| ---------- | ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `text`     | string           | Native text input. Existing `inputType` values remain supported.                                                                                                             |
| `email`    | string           | Native email input.                                                                                                                                                          |
| `tel`      | string           | Telephone input with a calling-code selector; the full number is stored as a string. Common codes are provided, and Other allows a manually entered international number.    |
| `url`      | string           | Displays an HTTPS prefix while storing the full URL; other explicitly entered schemes remain intact.                                                                         |
| `search`   | string           | Native search input with search and clear icons. `loading` shows the shared skeleton.                                                                                        |
| `password` | string           | Masked by default, with an icon to toggle visibility. Set `showStrength` for a basic length-and-character-variety indicator; it is not validation.                           |
| `otp`      | string           | Six numeric slots by default; length, separator, masking, alphanumeric validation, normalization and validation on completion are available.                                 |
| `theme`    | string           | System, light, or dark selection using Coss theme previews. The consuming application controls any actual theme change.                                                      |
| `number`   | number or `null` | Stepper; `min`, `max`, and `step` are optional. Step defaults to 1.                                                                                                          |
| `currency` | number or `null` | Formatted number; `currency` defaults to `USD`, `precision` defaults to 2, and step defaults to the smallest unit for that precision. `min`, `max`, and `step` are optional. |

Inputs use the shared disabled, read-only, hidden, loading, description and error states. The consuming Zod schema defines validation; use nullable number schemas when the empty numeric value is allowed. Currency is stored as a number, not a formatted string. Choose an ISO 4217 currency code and a precision supported by `Intl.NumberFormat`.

The field compositions adapt the Coss particles [group with select and input](https://coss.com/ui/r/p-group-18.json), [password visibility](https://coss.com/ui/r/p-input-9.json), [URL bar](https://coss.com/ui/r/p-input-10.json), [search icon](https://coss.com/ui/r/p-input-group-20.json), [clear button](https://coss.com/ui/r/p-input-group-22.json), and [textarea counter](https://coss.com/ui/r/p-textarea-11.json) to the kit’s form state.

Select fields use `type="select"` for a string value, `type="select-group"` with `groups` for grouped options, and `type="select-multiple"` for a string array, `type="select-rich"` for icons, flags, avatars and descriptions, and `type="select-timezone"` for searchable time zones ordered by their current UTC offset (combobox). Rich selects store the selected option's string value. Options can be disabled; basic select options can include descriptions. The controls adapt Coss [basic select](https://coss.com/ui/r/p-select-1.json), [grouped select](https://coss.com/ui/r/p-select-6.json), [multiple select](https://coss.com/ui/r/p-select-7.json), [disabled items](https://coss.com/ui/r/p-select-12.json), and [option descriptions](https://coss.com/ui/r/p-select-18.json).

`type="select-object"` retains the selected option object; supply a schema that preserves the desired properties. The palette preview uses the Coss swatch composition. `type="combobox"` stores a string and `type="combobox-multiple"` stores a string array. Both use the Coss searchable option list, with an optional clear action on the single field.

`type="autocomplete"` stores free-form text and presents suggestions from `options`; it supports the Coss sizes, clear and trigger actions, and automatic highlighting. A consuming schema decides whether free text is valid. The initial implementation adapts [basic autocomplete](https://coss.com/ui/r/p-autocomplete-1.json) and [clear action](https://coss.com/ui/r/p-autocomplete-8.json).

`type="checkbox"` stores a boolean and supports the Coss card presentation. `type="checkbox-group"` stores a string array and supports disabled options and a `selectAllLabel` parent control. `type="radio-group"` stores one string and supports descriptions and card-style options. Validation is supplied by the consuming schema.

Option-based fields accept externally loaded `options` (or `groups`), `loading`, and an `optionsError` message. Empty choices show a shared empty state, and the consuming application owns fetching, retrying, and updating options. A loading error is displayed with the field; validation errors take precedence. An options error is display state and does not by itself block submission; use the consuming schema or submit logic when that is required. Async schema validation and async submission use the existing form lifecycle.

## Usage

Compose inside a client component. Keep business schemas, option fetching, mutations and navigation in the consuming module.

```tsx
"use client"

import { FormKit } from "@features/form"
import { z } from "zod"

const schema = z.object({ title: z.string().min(1), notes: z.string() })

export function Example() {
  return (
    <FormKit
      schema={schema}
      defaultValues={{ title: "", notes: "" }}
      onSubmit={(values) => console.log(values)}
    >
      <FormKit.Field type="text" name="title" label="Title" />
      <FormKit.Field type="textarea" name="notes" label="Notes" />
      <FormKit.Actions>
        <FormKit.Reset />
        <FormKit.Submit />
      </FormKit.Actions>
    </FormKit>
  )
}
```

The field components are also exported for direct use inside either kit. Throw an `Error` from submit to show a form error, or a flat `{ fieldErrors, formErrors }` result to show validation errors. Adapt transport-specific responses in the consuming module.

Consumers add `"@features/form": "workspace:*"` when first using it. Run `pnpm check` to verify formatting, lint and TypeScript across the workspace.

## Architecture validation

Checked against [feature scaffold](../../docs/features/tree-and-scaffold.md), [public API rules](../../docs/features/package-and-api.md), [layer boundaries](../../docs/layers.md), and [TypeScript policy](../../packages/typescript-config/README.md).

- Reusable capability only; no app/module imports, routes, business workflows, provider SDK setup or environment access.
- One root package export; `@packages/ui` resolves through its package exports.
- Implementation and form-state effects stay in `capability/`; `utils/` contains only pure error mapping.
- Full scaffold, prefixed source filenames, named prop types and strict TypeScript; empty directories use `.gitkeep`.
- Fixed defaults and inline Tailwind classes remain. Field IDs are unique across forms; submit uses the shared UI button’s loading API.

Additional fields: `switch` and `toggle` store booleans; `toggle-group` stores a string array; `segmented` stores one option value; `slider` stores a number and `slider-range` stores a number array; `date` stores a `Date` or `undefined`.
