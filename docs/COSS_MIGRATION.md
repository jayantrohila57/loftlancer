# COSS UI migration plan (Radix → Base UI / coss ui)

**Status:** **Completed** for `apps/web` — Radix removed; primitives are coss ui (Base UI). This file is kept as a **migration reference map**.  
**Current guidance:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md) (spacing, layout, icons).  
**Scope:** `apps/web` UI layer (`src/components/ui/*`, consumers, theme, dependencies).  
**Goal (achieved):** Zero Radix in the repo; primitives from [coss ui](https://coss.com/ui) (Base UI).

**References**

| Resource | URL |
|----------|-----|
| coss ui docs | https://coss.com/ui/docs |
| Get started / CLI | https://coss.com/ui/docs/get-started |
| Styling & tokens | https://coss.com/ui/docs/styling |
| Radix migration guide | https://coss.com/ui/docs/radix-migration |
| Registry index | https://coss.com/ui/r/registry.json |
| shadcn Base UI docs | https://ui.shadcn.com/docs/components (use `base=base-ui` on create/add) |
| Base UI | https://base-ui.com/ |

---

## 1. Setup: coss ui, registry, theme, fonts, Base UI

### 1.1 Current state (`apps/web`)

| Item | Today |
|------|--------|
| `components.json` | `style: "radix-mira"`, `baseColor: "mist"`, `registries: {}` |
| Primitives | 54 files under `src/components/ui/*` generated from shadcn **Radix** preset `b2CjxkLnk` |
| CSS | `src/index.css` — OKLCH mist theme, teal primary, `--radius: 0.625rem`, Instrument Sans `--font-sans` |
| Radix deps | Unified `radix-ui` in primitives + 26 `@radix-ui/react-*` in `package.json` (mostly redundant with unified package) |
| Toasts | `sonner` + `src/components/ui/sonner.tsx` in `providers.tsx` |
| Direction | `DirectionProvider` from `src/components/ui/direction.tsx` (Radix) |

### 1.2 Target: shadcn CLI + coss registry

coss ui is distributed as a **shadcn registry** (`@coss/*`), not a single npm UI kit you import wholesale. The CLI copies component source into `components/ui` and pulls dependencies (notably `@base-ui/react` via `@coss/style` / per-component deps).

**Recommended commands (from `apps/web`, after updating `components.json`):**

```bash
# One-shot theme + all primitives + fonts (greenfield-style; review diff on existing app)
pnpm dlx shadcn@latest add @coss/style

# Or incremental:
pnpm dlx shadcn@latest add @coss/ui
pnpm dlx shadcn@latest add @coss/colors-neutral   # tokens only, if not using full @coss/style
```

**New project equivalent:** `pnpm dlx shadcn@latest init @coss/style` (installs Inter + Geist Mono by default — we will override fonts; see open questions).

**`components.json` changes (planned):**

```json
{
  "style": "new-york",
  "tailwind": {
    "css": "src/index.css",
    "baseColor": "neutral",
    "cssVariables": true
  },
  "registries": {
    "@coss": "https://coss.com/ui/r/{name}.json"
  }
}
```

Exact `style` / fields should match what the coss CLI expects when running `add @coss/style` (verify against CLI output during implementation). Remove Radix-specific `radix-mira` / `mist` preset alignment unless we consciously re-tune coss neutral tokens toward current brand colors.

**Registry meta (verified):**

- `@coss/ui` — bundle depending on all primitives, including **`sidebar`**, **`menu`**, **`toast`**, **`command`**, **`preview-card`**, etc. ([registry `ui` item](https://coss.com/ui/r/registry.json)).
- `@coss/style` — depends on `@base-ui/react`, wires `@coss/ui` + `@coss/fonts` + global CSS tokens ([coss styling](https://coss.com/ui/docs/styling)).

### 1.3 CSS tokens and theme

coss uses the same **semantic token names** as shadcn, plus:

- `--destructive-foreground`
- `--info` / `--info-foreground`
- `--success` / `--success-foreground`
- `--warning` / `--warning-foreground`

Default `@coss/style` uses **neutral** primary (not teal), **opaque borders**, and sidebar tokens. Expect a visible shift unless we re-map `--primary` (and related) after install.

**Base UI layout requirements** ([styling — Base UI setup](https://coss.com/ui/docs/styling#base-ui-setup)):

- Wrap app content in `className="isolate relative flex min-h-svh flex-col"` (stacking context for portaled UI).
- `body` should include `relative` for iOS Safari 26+ backdrop behavior.

### 1.4 Fonts

coss expects:

- `--font-sans` (body)
- `--font-mono` (code / kbd)
- `--font-heading` (dialog/sheet/empty titles; often aliased to `--font-sans`)

Today: **Instrument Sans** on `--font-sans` in `src/app/layout.tsx`; unused **Poppins** variable on `body`. After migration, either:

- Keep Instrument Sans on `--font-sans` (and alias `--font-heading`), or
- Adopt `@coss/fonts` (Inter + Geist Mono) from `@coss/style`.

### 1.5 Base UI dependencies

- **Primary:** `@base-ui/react` (installed with `@coss/style` / components).
- **Utilities:** Prefer `@coss/ui/base-ui/*` re-exports (`use-render`, `merge-props`, `direction-provider`, `csp-provider`) instead of duplicating `@base-ui/react` in app code ([get started — Base UI re-exports](https://coss.com/ui/docs/get-started#base-ui-re-exports)).
- **No Radix Slot:** `asChild` → `render` prop pattern on triggers, buttons, menu items, etc. ([radix migration](https://coss.com/ui/docs/radix-migration#the-aschild-to-render-pattern)).

### 1.6 shadcn Base UI fallbacks (components missing from `@coss/ui`)

Use when coss registry has **no** first-class primitive (verified absent from `@coss/ui` bundle list):

| Need | Fallback source |
|------|-----------------|
| **Chart** (Recharts wrapper) | shadcn chart with Base UI: https://ui.shadcn.com/docs/components/chart |
| **Carousel** (Embla) | shadcn carousel, Base UI variant if available; else keep Embla wrapper without Radix |
| **Resizable** panels | shadcn resizable ( `react-resizable-panels` ) — confirm Base UI template |
| **Aspect ratio** | Native `aspect-*` Tailwind or minimal wrapper (no Radix) |
| **Item** (list row primitive) | Drop file if unused, or shadcn Base UI `item` if added to upstream |
| **Native select** | Delete if unused; use `<select>` or coss `Select` |
| **Menubar / Navigation menu** | Unused in app; delete or shadcn Base UI only if needed later |

**Command:** `pnpm dlx shadcn@latest add <component> --base base-ui` (confirm exact flag in current shadcn CLI help during implementation).

**Sidebar:** coss includes `@coss/sidebar` in `@coss/ui` — prefer coss over shadcn fallback.

---

## 2. Inventory: `components/ui/*` → coss / fallback / action

Docs URL pattern: `https://coss.com/ui/docs/components/<kebab-name>`.

| Current file | Used outside `ui/`? | Target | Docs / fallback | Notes |
|--------------|---------------------|--------|-------------------|--------|
| `accordion.tsx` | No | `@coss/accordion` | [accordion](https://coss.com/ui/docs/components/accordion) | `type` → `multiple`; `AccordionPanel` |
| `alert.tsx` | No* | `@coss/alert` | [alert](https://coss.com/ui/docs/components/alert) | *Only via `ui/` internals if any |
| `alert-dialog.tsx` | Yes (2) | `@coss/alert-dialog` | [alert-dialog](https://coss.com/ui/docs/components/alert-dialog) | `Action`/`Cancel` → `AlertDialogClose` + `render` |
| `aspect-ratio.tsx` | No | **No coss** | shadcn Base UI or CSS | Remove if unused |
| `avatar.tsx` | Yes (6) | `@coss/avatar` | [avatar](https://coss.com/ui/docs/components/avatar) | |
| `badge.tsx` | Yes (10) | `@coss/badge` | [badge](https://coss.com/ui/docs/components/badge) | Default size smaller; use `lg` for old default |
| `breadcrumb.tsx` | Yes (1) | `@coss/breadcrumb` | [breadcrumb](https://coss.com/ui/docs/components/breadcrumb) | `asChild` → `render` on link |
| `button.tsx` | Yes (35) | `@coss/button` | [button](https://coss.com/ui/docs/components/button) | Dense sizes; `lg` ≈ old default height |
| `button-group.tsx` | No | `@coss/group` | [group](https://coss.com/ui/docs/components/group) | `GroupSeparator` required between controls |
| `calendar.tsx` | No | `@coss/calendar` | [calendar](https://coss.com/ui/docs/components/calendar) | |
| `card.tsx` | Yes (16) | `@coss/card` | [card](https://coss.com/ui/docs/components/card) | Prefer `CardPanel`; legacy `CardContent` may exist |
| `carousel.tsx` | No | **Fallback** | shadcn carousel | Embla-based |
| `chart.tsx` | Yes (1) | **Fallback** | [shadcn chart](https://ui.shadcn.com/docs/components/chart) | Recharts; not in coss registry |
| `checkbox.tsx` | No | `@coss/checkbox` | [checkbox](https://coss.com/ui/docs/components/checkbox) | |
| `collapsible.tsx` | Yes (2) | `@coss/collapsible` | [collapsible](https://coss.com/ui/docs/components/collapsible) | `CollapsiblePanel`; trigger `render` |
| `command.tsx` | No | `@coss/command` | [command](https://coss.com/ui/docs/components/command) | **Breaking:** data-driven API, no cmdk |
| `context-menu.tsx` | No | `@coss/context-menu` | [context-menu](https://coss.com/ui/docs/components/context-menu) | |
| `dialog.tsx` | Yes (6) | `@coss/dialog` | [dialog](https://coss.com/ui/docs/components/dialog) | `DialogPopup` + `DialogPanel` |
| `direction.tsx` | Yes (providers) | `@coss/direction-provider` | registry `direction-provider` | Use `@coss/ui/base-ui/direction-provider` |
| `drawer.tsx` | No | `@coss/drawer` | [drawer](https://coss.com/ui/docs/components/drawer) | May replace `vaul` usage in generated file |
| `dropdown-menu.tsx` | Yes (7) | `@coss/menu` | [menu](https://coss.com/ui/docs/components/menu) | Install `menu.tsx`; keep `DropdownMenu*` legacy exports or rename imports |
| `empty.tsx` | Yes (3) | `@coss/empty` | [empty](https://coss.com/ui/docs/components/empty) | |
| `field.tsx` | No | `@coss/field` | [field](https://coss.com/ui/docs/components/field) | |
| `hover-card.tsx` | Yes (1) | `@coss/preview-card` | [preview-card](https://coss.com/ui/docs/components/preview-card) | Rename to `preview-card.tsx` or alias exports |
| `input.tsx` | Yes (10) | `@coss/input` | [input](https://coss.com/ui/docs/components/input) | `size="lg"` ≈ old 36px height |
| `input-group.tsx` | No | `@coss/input-group` | [input-group](https://coss.com/ui/docs/components/input-group) | No `InputGroupButton` — use `Button` in addon |
| `input-otp.tsx` | No | `@coss/otp-field` | [otp-field](https://coss.com/ui/docs/components/otp-field) | Remove `input-otp` package |
| `item.tsx` | No | **Fallback / delete** | shadcn item or remove | Unused |
| `kbd.tsx` | No | `@coss/kbd` | [kbd](https://coss.com/ui/docs/components/kbd) | |
| `label.tsx` | Yes (3) | `@coss/label` | [label](https://coss.com/ui/docs/components/label) | |
| `menubar.tsx` | No | **Fallback / delete** | shadcn menubar | Unused |
| `native-select.tsx` | No | **Delete** | — | Unused |
| `navigation-menu.tsx` | No | **Particles / delete** | coss particles `p-navigation-*` | Unused in app |
| `pagination.tsx` | No | `@coss/pagination` | [pagination](https://coss.com/ui/docs/components/pagination) | |
| `popover.tsx` | No | `@coss/popover` | [popover](https://coss.com/ui/docs/components/popover) | |
| `progress.tsx` | No | `@coss/progress` | [progress](https://coss.com/ui/docs/components/progress) | Compose `ProgressTrack` / `ProgressIndicator` |
| `radio-group.tsx` | No | `@coss/radio-group` | [radio-group](https://coss.com/ui/docs/components/radio-group) | `Radio` vs `RadioGroupItem` |
| `resizable.tsx` | No | **Fallback** | shadcn resizable | `react-resizable-panels` |
| `scroll-area.tsx` | No | `@coss/scroll-area` | [scroll-area](https://coss.com/ui/docs/components/scroll-area) | |
| `select.tsx` | Yes (3) | `@coss/select` | [select](https://coss.com/ui/docs/components/select) | **Requires `items` prop** for SSR |
| `separator.tsx` | Yes (3) | `@coss/separator` | [separator](https://coss.com/ui/docs/components/separator) | |
| `sheet.tsx` | No* | `@coss/sheet` | [sheet](https://coss.com/ui/docs/components/sheet) | Used inside `sidebar.tsx` |
| `sidebar.tsx` | Yes (4) | `@coss/sidebar` | registry + coss docs | Re-apply product overrides (flat inset, lg breakpoint) |
| `skeleton.tsx` | Yes (14) | `@coss/skeleton` | [skeleton](https://coss.com/ui/docs/components/skeleton) | coss skeleton animation token |
| `slider.tsx` | No | `@coss/slider` | [slider](https://coss.com/ui/docs/components/slider) | `value={[n]}` arrays |
| `sonner.tsx` | Yes (providers) | `@coss/toast` | [toast](https://coss.com/ui/docs/components/toast) | Replace Sonner API app-wide |
| `spinner.tsx` | Yes (7) | `@coss/spinner` | [spinner](https://coss.com/ui/docs/components/spinner) | |
| `switch.tsx` | Yes (2) | `@coss/switch` | [switch](https://coss.com/ui/docs/components/switch) | |
| `table.tsx` | Yes (2) | `@coss/table` | [table](https://coss.com/ui/docs/components/table) | |
| `tabs.tsx` | Yes (1) | `@coss/tabs` | [tabs](https://coss.com/ui/docs/components/tabs) | `TabsPanel`; optional `TabsTab` |
| `textarea.tsx` | Yes (4) | `@coss/textarea` | [textarea](https://coss.com/ui/docs/components/textarea) | |
| `toggle.tsx` | No | `@coss/toggle` | [toggle](https://coss.com/ui/docs/components/toggle) | |
| `toggle-group.tsx` | No | `@coss/toggle-group` | [toggle-group](https://coss.com/ui/docs/components/toggle-group) | `multiple` boolean vs `type` |

---

## 3. Usage sites and API changes

### 3.1 Cross-cutting API migrations

| Pattern | Radix / shadcn today | coss / Base UI |
|---------|----------------------|----------------|
| Composition | `asChild` on `Button`, triggers, `Badge`, `BreadcrumbLink`, sidebar slots | `render={<Button />}` or `render={<Link href="..." />}` |
| Open state attrs | `data-state="open"` (some CSS still uses this) | `data-open`, `data-closed`, `data-checked`, `data-disabled` ([migration guide](https://coss.com/ui/docs/radix-migration)) |
| Dialog content | `DialogContent` | `DialogPopup` + optional `DialogPanel` |
| Sheets | `SheetContent` | `SheetPopup` + `SheetPanel` |
| Tooltips | `TooltipContent` | `TooltipPopup` (legacy `TooltipContent` may exist) |
| Menus | `DropdownMenu*`, `onSelect` | `Menu*` (or legacy aliases), `onClick` on items |
| Select | children-only items | `items={[...]}` on `Select` + map in `SelectPopup` |
| Alert dialog actions | `AlertDialogAction` / `Cancel` | `AlertDialogClose` with `render` + variants |
| Collapsible body | `CollapsibleContent` | `CollapsiblePanel` |
| Tabs body | `TabsContent` | `TabsPanel` |
| Hover card | `HoverCard*` | `PreviewCard*` |
| Toast | `import { toast } from "sonner"` | `toastManager.add` / `ToastProvider` ([toast migration](https://coss.com/ui/docs/radix-migration#toast)) |

**`data-state` in app code (update selectors):**

- `src/domain/projects/components/project-list.tsx` — `group-data-[state=open]:rotate-180` on collapsible chevron
- `src/components/nav-main.tsx` — `group-data-[state=open]/collapsible:rotate-90`
- Re-test sidebar collapsed selectors in `sidebar.tsx` after coss sidebar regen (may use different data attrs)

**Direct Radix import (must remove):**

- `src/domain/auth/components/dropdown-sign-out.tsx` — `@radix-ui/react-dropdown-menu` → coss `MenuItem` or shared sign-out item using `@/components/ui/menu`

### 3.2 Per-component consumer files

Paths are under `apps/web/`. “API touch” = likely code change beyond import path.

#### `button` (35 files)

All listed in §2 usage; **API touch** wherever `asChild` is used:

| File | Changes |
|------|---------|
| `components/patterns/page-header.tsx` | `asChild` → `render={<Link ... />}` |
| `domain/home/home.features.tsx`, `home.hero.tsx` | `Button asChild` + Link |
| `domain/home/home.pricing.tsx` | conditional `asChild` → conditional `render` |
| `app/not-found.tsx`, `app/(private)/not-found.tsx` | `Button asChild` + Link |
| `components/patterns/empty-state.tsx` | `Button asChild` |
| `domain/projects/project-detail.tsx` | nested `TooltipTrigger asChild` + `Button asChild` → double `render` chain |

Review **size parity**: custom `icon-sm`, `size-11`, `touchTarget` may need `size="lg"` / `icon-lg` on coss buttons for same hit targets.

#### `card` (16 files)

Mostly static layout; optional rename `CardContent` → `CardPanel` if legacy export removed.

#### `skeleton` (14 files)

Class names should remain; verify coss skeleton shimmer vs current.

#### `input` (10 files)

Consider `size="lg"` if inputs feel too short; no `asChild`.

#### `badge` (10 files)

If linked badges added later: `render` instead of `asChild`.

#### `tooltip` (7 files)

| File | Changes |
|------|---------|
| `app/(private)/layout.tsx` | `TooltipProvider` — confirm coss provider API |
| `components/org/org-switcher.tsx` | `TooltipTrigger asChild` |
| `components/patterns/icon-button.tsx` | `TooltipTrigger asChild` |
| `domain/projects/project-detail.tsx` | `TooltipTrigger asChild` |
| `domain/environments/delete-environment-dialog.tsx`, `edit-environment-dialog.tsx` | `TooltipTrigger asChild` |
| `components/go-back.tsx` | `TooltipTrigger asChild` |

#### `spinner` (7 files)

Drop-in expected; used inside buttons.

#### `separator` (3 files)

Drop-in.

#### `dropdown-menu` → `menu` (7 files)

| File | Changes |
|------|---------|
| `domain/environments/variables-table-view.tsx` | `DropdownMenuTrigger asChild`; `onSelect` → `onClick` |
| `domain/projects/project-actions.tsx` | `asChild` trigger; `DropdownMenuItem asChild`; many `onSelect` |
| `components/org/org-switcher.tsx` | `asChild` trigger + item; `onSelect` |
| `domain/auth/user-menu.tsx` | `asChild` trigger; `forceMount` — verify Base UI equivalent |
| `domain/environments/variables-mobile-list.tsx` | `modal={false}` — check Menu prop name |
| `components/mode-toggle.tsx` | `asChild` trigger |
| `domain/projects/project-edit-dialog.tsx` | `onSelect` on item |

#### `dialog` (6 files)

| File | Changes |
|------|---------|
| `add-variable-dialog.tsx`, `create-environment-dialog.tsx` | `DialogTrigger asChild` → `render` |
| `delete-environment-dialog.tsx`, `edit-environment-dialog.tsx`, `edit-variable-dialog.tsx`, `project-edit-dialog.tsx` | footer close buttons; optional `DialogPanel` for body |

#### `avatar` (6 files)

Drop-in; optional `render` if wrapping links later.

#### `textarea` (4 files)

Drop-in; align `size` with inputs if needed.

#### `sidebar` (4 files)

| File | Changes |
|------|---------|
| `app/(private)/layout.tsx` | `SidebarProvider`, `SidebarInset`, `TooltipProvider` |
| `components/app-sidebar.tsx` | `SidebarMenuButton` `asChild` + `isActive` |
| `components/nav-main.tsx` | `CollapsibleTrigger asChild`, `SidebarMenuSubButton asChild` |
| `components/org/org-switcher.tsx` | `useSidebar()` |

**Re-apply post-preset merges** from `docs/DESIGN_SYSTEM.md`: lg=1024 sidebar, flat `SidebarInset`, no card shell.

#### `label` (3 files)

Drop-in.

#### `select` (3 files) — **highest risk**

| File | Changes |
|------|---------|
| `organization-settings-client.tsx` | Add `items` arrays for role/org selects |
| `domain/audit/audit-logs.tsx` | Filter select + `items` |
| `domain/environments/environments-tabs-view.tsx` | Mobile environment select + `items` |

#### `empty` (3 files)

`empty-state.tsx`, `error-state.tsx`, `environments-tabs-view.tsx` — verify `Empty*` subcomponent names unchanged.

#### `table` (2 files)

`variables-table-view.tsx`, `audit-log-table-view.tsx` — drop-in.

#### `switch` (2 files)

`project-create.tsx`, `project-edit.tsx` — drop-in.

#### `collapsible` (2 files)

| File | Changes |
|------|---------|
| `project-list.tsx` | `CollapsibleTrigger` may need `render`; update `data-[state=open]` rotation classes |
| `nav-main.tsx` | `CollapsibleTrigger asChild`; chevron `group-data-[state=open]` |

#### `alert-dialog` (2 files)

| File | Changes |
|------|---------|
| `components/patterns/confirm-dialog.tsx` | Replace `AlertDialogAction` / `Cancel` with `AlertDialogClose` + `render`; pending state on close buttons |
| `organization-settings-client.tsx` | Delete org flow — same action/cancel migration |

#### `breadcrumb` (1 file)

`components/breadcrumbs.tsx` — `BreadcrumbLink asChild` → `render`.

#### `chart` (1 file)

`components/dashboard-stats.tsx` — replace `chart.tsx` with shadcn Base UI chart; ensure no Radix in chart primitive.

#### `hover-card` → `preview-card` (1 file)

`components/patterns/truncated-text.tsx` — rename imports; `HoverCardTrigger asChild` → `PreviewCardTrigger render`.

#### `tabs` (1 file)

`environments-tabs-view.tsx` — `TabsContent` → `TabsPanel`; triggers may become `TabsTab` (legacy `TabsTrigger` may remain).

### 3.3 Non-`ui` modules that import UI

| File | Role |
|------|------|
| `components/providers.tsx` | `Toaster` → `ToastProvider`; remove Sonner |
| `utils/trpc.ts`, hooks, auth, org | `toast` from `sonner` → coss toast manager |
| `domain/auth/dropdown-sign-out.tsx` | Remove `@radix-ui/react-dropdown-menu` |

---

## 4. Custom / pattern components and styling to revisit

These are **not** replaced by coss, but depend on primitives and custom product styling:

| Component | Path | Migration impact |
|-----------|------|------------------|
| `IconButton` | `components/patterns/icon-button.tsx` | `TooltipTrigger render`; button sizes |
| `SubmitButton` | `components/patterns/submit-button.tsx` | Button + Spinner |
| `ConfirmDialog` | `components/patterns/confirm-dialog.tsx` | Alert dialog API |
| `EmptyState` / `ErrorState` | `components/patterns/empty-state.tsx`, `error-state.tsx` | Empty + Button `render` |
| `PageHeader` | `components/patterns/page-header.tsx` | Button `render` |
| `FormField` | `components/patterns/form-field.tsx` | Label |
| `StatusBadge` | `components/patterns/status-badge.tsx` | Badge density |
| `DataCard` | `components/patterns/data-card.tsx` | Card |
| `TruncatedText` | `components/patterns/truncated-text.tsx` | Preview card |
| `CopyButton` | `components/patterns/copy-button.tsx` | IconButton chain |
| Layout | `page-container.tsx`, `page-shell.tsx`, etc. | Unchanged structure |
| `AppSidebar`, `NavMain`, `OrgSwitcher`, `UserMenu`, `ModeToggle` | Compose menu/sidebar/tooltip |
| `touchTarget` helper | `lib/utils.ts` | Keep; may pair with coss `icon-lg` / `size="lg"` |

### 4.1 Visual / styling expected to change

Unless explicitly re-tuned after `@coss/style`:

| Area | Today | After coss default |
|------|--------|---------------------|
| Primary brand | Teal OKLCH mist preset | Neutral dark primary |
| Control density | radix-mira compact | coss default (smaller); use `lg` sizes for parity |
| Borders / depth | Mist soft borders | Opaque border + shadow system |
| Typography | Instrument Sans | Inter if `@coss/fonts` applied |
| Radius | 10px (`0.625rem`) | coss default `0.625rem` (similar) but component chrome differs |
| Toasts | Sonner rich colors | coss toast variants (`type`, `actionProps`) |
| Buttons | `cursor-pointer` on preset | Confirm coss button includes pointer |
| Focus rings | ring-based mira | Base UI focus-visible patterns |

**Dropped / simplified:** Radix-specific CSS vars in dropdown content (`--radix-dropdown-menu-*`), `Slot` composition, redundant wrapper `data-slot` conventions where coss differs.

**Preserved intentionally (re-apply after CLI):** flat dashboard canvas, sidebar breakpoint 1024, logical RTL utilities, page padding scale (`docs/DESIGN_SYSTEM.md`).

---

## 5. Dependencies

### 5.1 Remove (target zero)

From `apps/web/package.json`:

- `radix-ui`
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-label`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-select`
- `@radix-ui/react-separator`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`

Also remove after migration:

- `sonner` (if moving to coss toast)
- `cmdk` (if `command.tsx` regenerated without cmdk)
- `input-otp` (replaced by coss OTP field)
- `vaul` (only if coss drawer drops it — verify generated drawer deps)

### 5.2 Add / keep

| Package | Purpose |
|---------|---------|
| `@base-ui/react` | Base UI primitives (via `@coss/style`) |
| `class-variance-authority`, `clsx`, `tailwind-merge`, `cn` | Unchanged |
| `lucide-react` | Icons |
| `recharts` | Dashboard chart (with shadcn chart fallback) |
| `embla-carousel-react` | Only if carousel kept |
| `react-resizable-panels` | Only if resizable kept |
| `react-day-picker` | Calendar |
| `date-fns` | Date utilities |
| `next-themes` | Dark mode (compatible with coss tokens) |

### 5.3 Verification grep (post-migration)

```bash
cd apps/web
rg -n 'radix-ui|@radix-ui' --glob '!node_modules'
rg -n 'from \"sonner\"' src
rg -n 'asChild' src   # should trend to zero in app code; some legacy exports may remain in ui wrappers
```

---

## 6. Ordered migration steps, risks, open questions

### 6.1 Proposed phases

1. **Approval gate** — Confirm theme brand, toast strategy, font choice (this document).
2. **Branch** — `cursor/coss-ui-migration-2f0d` (implementation work off `main`).
3. **Registry + style** — Update `components.json`; run `pnpm dlx shadcn@latest add @coss/style` (or `@coss/ui` + `@coss/colors-neutral`); add Base UI layout isolation to root layout.
4. **Primitives overwrite** — Replace all `src/components/ui/*` from coss; add shadcn Base UI **chart** (and delete unused Radix-only files: menubar, navigation-menu, native-select, etc.).
5. **Sidebar merge** — Re-apply flat inset, `useIsMobile` 1024, product nav structure.
6. **Toast migration** — `ToastProvider`, replace all `sonner` calls (~12 files).
7. **Menu migration** — Rename/adapt dropdown-menu consumers; fix `dropdown-sign-out.tsx`.
8. **High-touch overlays** — Dialogs, alert-dialogs, tooltips, collapsibles (`render`, panels).
9. **Select migration** — `items` prop on all three select call sites.
10. **Pattern pass** — `IconButton`, `ConfirmDialog`, links-as-buttons.
11. **Theme tune** — Reintroduce teal primary on coss neutral base if desired; Instrument Sans on `--font-sans`.
12. **Cleanup** — Remove Radix deps; remove `sonner`, `cmdk`, `input-otp` if unused; update `docs/DESIGN_SYSTEM.md`.
13. **QA** — `pnpm install --frozen-lockfile`, `pnpm build`, biome lint, and manual keyboard testing on menus/dialogs/sidebar.
14. **Proof** — Radix grep clean; PR for review.

### 6.2 Risks

| Risk | Mitigation |
|------|------------|
| Select SSR/hydration without `items` | Build `items` arrays in all select consumers first |
| Toast API churn | Single wrapper `lib/toast.ts` mapping old calls to `toastManager` |
| Visual regression (brand, density) | Snapshot key pages; explicit size `lg` mapping table from radix migration doc |
| Sidebar regression | Port custom sidebar behavior before merging nav |
| Chart not in coss | Isolate shadcn Base UI chart; audit for Radix |
| `forceMount` / `modal={false}` on menus | Check Base UI Menu docs per call site |
| Biome overrides on `ui/**` | Re-evaluate after regen |
| Keyboard navigation regressions | Manually test menus, dialogs, and sidebar navigation after overlay migrations |

### 6.3 Open questions for product owner

1. **Theme:** Adopt default coss **neutral** look, or re-map **teal mist** primary onto `@coss/colors-neutral` / custom CSS after install?
2. **Fonts:** Keep **Instrument Sans**, or switch to **Inter + Geist Mono** from `@coss/fonts`?
3. **Toast:** Full migration to coss **Toast** in one pass, or temporary Sonner until UI stable?
4. **Density:** Globally bump interactive controls to coss **`lg`** sizes for shadcn parity, or embrace denser coss defaults?
5. **Dropdown naming:** Prefer import migration to `@/components/ui/menu` (`Menu*`) or keep `dropdown-menu.tsx` legacy re-exports only?
6. **Unused primitives:** Delete 20+ unused `ui` files after add, or keep full `@coss/ui` bundle for future features?
7. **DESIGN_SYSTEM.md:** Update preset section to coss (replace `b2CjxkLnk` / radix-mira) as part of migration PR?

---

## Appendix A — Sonner call sites (toast migration)

- `components/providers.tsx`
- `utils/trpc.ts`
- `components/org/active-organization-context.tsx`
- `components/patterns/copy-button.tsx`
- `domain/auth/github-login.tsx`, `user-menu.tsx`, `dropdown-sign-out.tsx`
- `domain/projects/hooks/use-projects.ts`
- `domain/environments/hooks/use-environments.ts`, `use-variables.ts`
- `app/(private)/dashboard/onboarding/onboarding-client.tsx`
- `app/(private)/dashboard/settings/organization/organization-settings-client.tsx`
- `domain/projects/components/project-actions.tsx`
- `components/org/org-switcher.tsx`

## Appendix B — `asChild` in application code (non-`ui/`)

| File |
|------|
| `domain/environments/variables-table-view.tsx` |
| `components/app-sidebar.tsx` |
| `components/patterns/page-header.tsx` |
| `domain/projects/project-detail.tsx` |
| `components/go-back.tsx` |
| `domain/projects/project-actions.tsx` |
| `domain/home/home.features.tsx` |
| `domain/home/home.pricing.tsx` |
| `components/org/org-switcher.tsx` |
| `components/patterns/truncated-text.tsx` |
| `components/nav-main.tsx` |
| `domain/auth/user-menu.tsx` |
| `domain/environments/add-variable-dialog.tsx` |
| `domain/environments/variables-mobile-list.tsx` |
| `domain/environments/create-environment-dialog.tsx` |
| `domain/home/home.hero.tsx` |
| `domain/environments/delete-environment-dialog.tsx` |
| `app/not-found.tsx`, `app/(private)/not-found.tsx` |
| `components/mode-toggle.tsx` |
| `components/patterns/empty-state.tsx` |
| `components/patterns/icon-button.tsx` |
| `domain/environments/edit-environment-dialog.tsx` |

---

*Generated for planning review. Implementation must not start until approved.*
