# Features — reusable organisms

**Router:** [../AGENTS.md](../AGENTS.md)

Use **`@features/*`** for **domain-independent** building blocks modules compose:

- Form patterns, field groups, wizards
- Data table / list primitives
- Role & permission UI patterns
- Search/filter shells

**MUST NOT** encode product workflows (checkout, onboarding steps tied to your SKU) — those stay in `@modules/*`.

Modules wire features with domain validation, orpc procedures, and route-specific layouts.

All application forms and fields follow the [form and field policy](./form.md).

Scaffold: [tree-and-scaffold.md](./tree-and-scaffold.md).
