# Forms and fields

This policy applies throughout the application: apps, modules, and reusable features.

- Build forms with `FormKit` and `FormKit.Field` from `@features/form`.
- For a standalone field that does not need a form, use `FieldKit` and `FieldKit.Field` from `@features/form`.
- Do not compose application forms or fields directly from raw HTML controls or `@packages/ui` field primitives. The form feature owns that composition and its shared behavior.
- If a required field type or capability is missing, implement it in `features/form` following the existing field implementations, expose it through the appropriate kit and public API, and then use it at the call site. Keep it reusable and domain-independent; the consuming module owns domain-specific validation and behavior.
- The form feature itself and the UI package may use the underlying UI primitives to implement the kits and their fields.

See the [form feature README](../../features/form/README.md) for supported fields and usage.
