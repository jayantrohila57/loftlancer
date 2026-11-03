# UI and UX — agent skills

Loftlancer product UI lives in `module/…/client`, `packages/ui`, and thin `apps/*`. **Agents must read the relevant skill file before writing or reviewing UI** — do not invent components, tokens, or interaction patterns when a skill covers the task.

**Skill root:** `.agents/skills/<skill-name>/SKILL.md` (installed via [skills-lock.json](../skills-lock.json)).

**Product docs (always with UI work):** [rendering.md](./rendering.md), [app-states.md](./app-states.md), [data-workflow.md](./data-workflow.md) (toast, empty, failed, error), [layouts.md](./layouts.md), [naming.md](./naming.md).

**Cursor rule:** [.cursor/rules/ui-ux.mdc](../.cursor/rules/ui-ux.mdc)

---

## Loftlancer UI stack

| Layer           | Location                                     | Notes                                                                                  |
| --------------- | -------------------------------------------- | -------------------------------------------------------------------------------------- |
| Design system   | `packages/ui` (`@loftlancer/ui`)             | shadcn **new-york** + `@coss` registry; naming exception — see `packages/ui/README.md` |
| App usage       | `apps/studio`, `apps/auth`, …                | Import `@loftlancer/ui` — not ad hoc copies                                            |
| Feature screens | `module/<feature>/client/studio` or `…/auth` | Boundaries, skeletons, hooks — see [modules.md](./modules.md)                          |

**Default Impeccable mode for Studio and Auth:** **Operate** (task completion, scanability, native expectations). Marketing (`apps/www`) may use **Persuade**; docs app **Read**.

---

## When to read which skill (required)

Read `SKILL.md` **in full** for that skill before the corresponding work. Multiple skills often apply in order (table below).

### 1. Building or changing product UI (screens, forms, dialogs)

| Order | Skill                           | Use when                                                                                                                                                        |
| ----- | ------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | **shadcn**                      | Adding/fixing components, `components.json`, CLI, tokens, forms, layout with existing primitives                                                                |
| 2     | **coss**                        | COSS/Base UI primitives, overlays, menus, toasts, migration assumptions from Radix                                                                              |
| 3     | **coss-particles**              | Finding a ready-made pattern (tables, dialogs-with-form, settings layouts) before custom markup                                                                 |
| 4     | **ui-ux-pro-max**               | Structure, accessibility, touch targets, responsive layout, typography/color decisions, charts                                                                  |
| 5     | **vercel-composition-patterns** | Complex widgets with many modes — prefer compound components over boolean props                                                                                 |
| 6     | **vercel-react-best-practices** | Performance: `dynamic()`, waterfalls, bundle size, re-renders ([`.agents/skills/vercel-react-best-practices/`](../.agents/skills/vercel-react-best-practices/)) |

**Minimum for any new** `client.`* **file:** **shadcn** + **coss** + **ui-ux-pro-max** (accessibility + layout category at least).

### 2. New screen, flow, or empty/error states

| Skill               | Use when                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------- |
| **ui-ux-pro-max**   | Navigation, forms & feedback, loading patterns, mobile-first                                            |
| **impeccable**      | Full **Operate** polish — hierarchy, spacing, copy, edge cases; run context script when skill specifies |
| **emil-design-eng** | Motion, transitions, micro-interactions, “feels wrong” polish                                           |

Align with [app-states.md](./app-states.md) (route skeletons) and [data-workflow.md](./data-workflow.md) (empty vs failed vs error — not generic ErrorState for validation).

### 3. Review, audit, or “check my UI”

| Skill                     | Use when                                                                               |
| ------------------------- | -------------------------------------------------------------------------------------- |
| **web-design-guidelines** | Compliance pass against Vercel Web Interface Guidelines (fetch latest rules per skill) |
| **ui-ux-pro-max**         | Category checklist (contrast, touch, CLS, forms)                                       |
| **emil-design-eng**       | Before/after table for animation and interaction details                               |

Run **web-design-guidelines** or **ui-ux-pro-max** pre-delivery checklist before marking UI issues done.

### 4. Visual direction, marketing, or distinctive landing UI

| Skill               | Use when                                                                           |
| ------------------- | ---------------------------------------------------------------------------------- |
| **frontend-design** | Distinctive marketing/hero direction; avoid generic AI layout tells                |
| **impeccable**      | **Persuade** or **Experience** modes; redesign vs refinement                       |
| **ui-ux-pro-max**   | Palettes, font pairings, style selection (`--domain style`, `color`, `typography`) |

**Do not** use **frontend-design** to override Studio/Auth **Operate** consistency — product chrome stays restrained.

### 5. Platform / component library work

| Skill                     | Use when                                                              |
| ------------------------- | --------------------------------------------------------------------- |
| **shadcn**                | Changes in `packages/ui`, registries, presets                         |
| **coss**                  | COSS component behavior in `@loftlancer/ui`                           |
| **migrate-radix-to-base** | Explicit Radix → Base UI migration (branch, one component per commit) |

### 6. Component architecture only (no visual redesign)

| Skill                           | Use when                                              |
| ------------------------------- | ----------------------------------------------------- |
| **vercel-composition-patterns** | Refactors with `isX` prop explosion, shared providers |
| **vercel-react-best-practices** | Server/client boundaries, serialization, Suspense     |

---

## Skill reference (paths)

| Skill                       | Path                                                  | One-line                                        |
| --------------------------- | ----------------------------------------------------- | ----------------------------------------------- |
| shadcn                      | `.agents/skills/shadcn/SKILL.md`                      | CLI, components, semantic tokens, form patterns |
| coss                        | `.agents/skills/coss/SKILL.md`                        | Base UI primitives, correct APIs                |
| coss-particles              | `.agents/skills/coss-particles/SKILL.md`              | 500+ copy-paste patterns index                  |
| ui-ux-pro-max               | `.agents/skills/ui-ux-pro-max/SKILL.md`               | Searchable UX rules, palettes, stacks           |
| impeccable                  | `.agents/skills/impeccable/SKILL.md`                  | Operate/Persuade modes, craft floor, audits     |
| frontend-design             | `.agents/skills/frontend-design/SKILL.md`             | Distinctive visual direction                    |
| emil-design-eng             | `.agents/skills/emil-design-eng/SKILL.md`             | Motion, polish, design-engineering taste        |
| web-design-guidelines       | `.agents/skills/web-design-guidelines/SKILL.md`       | WIG compliance review                           |
| vercel-composition-patterns | `.agents/skills/vercel-composition-patterns/SKILL.md` | Compound components, React 19                   |
| vercel-react-best-practices | `.agents/skills/vercel-react-best-practices/SKILL.md` | React/Next performance                          |
| migrate-radix-to-base       | `.agents/skills/migrate-radix-to-base/SKILL.md`       | Radix → Base UI migrations                      |

If a skill path is missing locally, sync skills from [skills-lock.json](../skills-lock.json) before UI work.

---

## Recommended workflow (new feature UI)

1. [new-feature-checklist.md](./new-feature-checklist.md) + [reference-module-teams.md](./reference-module-teams.md) — file names, boundary/content split.
2. Read **shadcn** + **coss** — pick primitives from `@loftlancer/ui`.
3. Read **coss-particles** — search index for similar UI; adapt particle if match.
4. Read **ui-ux-pro-max** — query domains relevant to the screen (`ux`, `style`, `chart`, …).
5. Implement with [rendering.md](./rendering.md) (`dynamic()` + skeleton) and ServiceResponse boundaries.
6. Read **emil-design-eng** for motion/transition pass if interactive.
7. Read **web-design-guidelines** or **ui-ux-pro-max** pro-rules — fix findings.
8. Complex shared widget → **vercel-composition-patterns** before merge.

---

## Hard rules (product UI)

- **Use** `@loftlancer/ui` **/ shadcn / coss** — no one-off duplicate Button/Dialog in feature modules.
- **Semantic tokens** — no raw `bg-blue-500` in feature code (shadcn skill).
- **ServiceResponse UI** — empty / failed / error / toast per [data-workflow.md](./data-workflow.md); skills do not replace this contract.
- **Accessibility** — ui-ux-pro-max priority 1–2 (contrast, focus, touch size) before “visual polish”.
- **Skills are mandatory** — skipping skill reads for UI tasks is not allowed; cite which skills you applied in PR/issue notes when useful.

---

## Related

- [product.md](./product.md) — permissions affect visible actions, not layout skills
- [architecture-gaps.md](./architecture-gaps.md) — structural gaps
- [index.md](./index.md)
