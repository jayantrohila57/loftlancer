# Design system (coss ui)

Loftlancer uses [coss ui](https://coss.com/ui) on [Base UI](https://base-ui.com/) via the shadcn registry (`@coss/*`). Components live under `packages/ui/src/components/ui/` as copied source (not Radix) and are imported as `@loftlancer/ui/<name>`; apps keep no local copies.

## Stack

| Layer | Choice |
|--------|--------|
| Primitives | coss ui (`pnpm dlx shadcn@latest add @coss/style` / `@coss/ui`) |
| Registry | `@coss` → `https://coss.com/ui/r/{name}.json` in `apps/web/components.json` |
| Styling | Default coss **neutral** tokens from `@coss/style` in `apps/web/src/index.css` |
| Fonts | **Inter** (`--font-sans`, `--font-heading`) + **Geist Mono** (`--font-mono`) via `next/font/google` in `apps/web/src/app/layout.tsx` |
| Icons | Lucide via canonical map (`apps/web/src/lib/icons.ts`) |
| Toasts | coss `ToastProvider` + `toastManager` (wrapper: `apps/web/src/lib/toast.ts`) |
| Dark mode | `next-themes` + semantic CSS variables |
| RTL | `DirectionProvider` (`@base-ui/react/direction-provider`); logical utilities in app code |

## Setup commands (reference)

From `apps/web`:

```bash
pnpm dlx shadcn@latest add @coss/style
# or: add @coss/ui and @coss/colors-neutral for incremental adoption
```

Base UI layout: root `body` is `relative`; app content is wrapped in `isolate relative flex min-h-svh flex-col` (see `src/app/layout.tsx`).

## Composition API (vs Radix)

| Old (Radix/shadcn) | coss / Base UI |
|--------------------|----------------|
| `asChild` | `render={<Button />}` / `render={<Link href="..." />}` |
| `DropdownMenu*` | `Menu`, `MenuTrigger`, `MenuPopup`, `MenuItem`, `MenuLinkItem` |
| `HoverCard*` | `PreviewCard`, `PreviewCardTrigger`, `PreviewCardPopup` |
| `DialogContent` | `DialogPopup` (+ optional `DialogPanel`) |
| `TooltipContent` | `TooltipPopup` |
| `TabsContent` | `TabsPanel` |
| `CollapsibleContent` | `CollapsiblePanel` |

See `docs/COSS_MIGRATION.md` for the full migration map.

## Spacing (sidebar scale)

All app layout spacing is derived from the coss **Sidebar** source (`packages/ui/src/components/ui/sidebar.tsx`). Do not invent parallel gutters (`p-4`, `gap-6`, `md:p-6`, etc.) in feature code—import tokens or layout primitives instead.

| Sidebar source | Token | Tailwind |
|----------------|-------|----------|
| `SidebarHeader`, `SidebarFooter`, `SidebarGroup` | `layoutGutterClass` | `p-2` |
| `SidebarContent` column | `layoutGapClass` | `gap-2` |
| `SidebarMenu` | `layoutMenuGapClass` | `gap-1` |
| `SidebarMenuButton` (default) | `layoutRowClass` | `h-8` |
| `SidebarMenuButton` `size="lg"` (team switcher) | `layoutRowLgClass` | `h-12` |
| `SidebarGroupLabel` | `layoutGroupLabelClass` | `h-8`, `px-2`, `text-xs` |

**Canonical module:** `apps/web/src/lib/layout-spacing.ts` — add or change spacing here; feature code imports tokens only.

**Composed layout tokens** (defined in `layout-spacing.ts`, not duplicated in pages):

| Token | Tailwind | Use |
|-------|----------|-----|
| `layoutInsetXClass` | `px-4`, `md:px-6` | Shared horizontal inset for dashboard chrome + main scroll |
| `layoutInsetContainerWideClass` / `Narrow` | `w-full min-w-0` | Width wrapper inside inset (`DashboardInsetContainer`) |
| `marketingContainerClass` | `max-w-6xl`, `px-4`, `md:px-6` | Public marketing column only |
| `layoutSectionStackClass` | `flex`, `gap-2` | Generic vertical stacks |
| `layoutContentClass` | `flex-1`, `gap-2`, `p-2` | Legacy `PageMain` / page-state shell |
| `layoutDashboardSectionGapClass` | `gap-4` | Section rhythm inside dashboard pages |
| `layoutDashboardScrollTopClass` | `pt-4` | Space below sticky `PageHeaderBar` |
| `layoutDashboardScrollClass` | scroll + inset tokens above | `Shell.Main` `variant="dashboard"` |
| `layoutDashboardPageStackClass` | `gap-4` stack | `DashboardSection` page rhythm |
| `layoutChromeClass` / `layoutChromeRowClass` | `py-2`, `gap-2`, `h-12` | Sticky app header bar |
| `layoutPageHeaderRowClass` | `min-h-12`, `gap-2` | In-page title rows (`PageHeader`) |
| `layoutFormStackClass` | `grid`, `gap-2` | Form field stacks |
| `layoutToolbarClass` | `flex`, `gap-2` | Table / list toolbars |
| `layoutPageTitleClass` | `text-lg` / `text-xl` | Primary in-page heading |

Do not copy `px-4`, `gap-4`, or `pt-4` into feature files unless you are extending this module — those values are centralized so the dashboard inset stays consistent.

**Composed primitives** (no new visuals—only class composition):

| Primitive | Path | Use |
|-----------|------|-----|
| `PageMain` | `components/layout/app-layout.tsx` | Dashboard main scroll area (`layoutContentClass`) |
| `PageStack` | same | Vertical sections (`gap-2`) |
| `PageHeaderBar` / `PageHeaderRow` | same | Sticky inset header; **same `p-2` + `h-12` row as `SidebarHeader` + team switcher** |
| `PageHeader` | `components/layout/page-header.tsx` | In-page title row with optional inline back (`back="auto"` via `lib/page-back.ts`) |
| `AccordionSection` | `components/patterns/accordion-section.tsx` | Consistent disclosure pattern for page subsections |
| `PageTitleRow` | same | In-page title + action (`text-sm` title) |
| `PageToolbar` | same | Filters / search above tables |
| `FormSheet*` | `components/patterns/form-sheet.tsx` | Full-height inset sheets; header/footer/body share coss `px-6` |
| `DashboardSection` | `components/section-dashboard.tsx` | Wraps `PageStack` + `PageTitleRow` |
| `FormSection` | `components/layout/form-section.tsx` | Form blocks (`gap-2`) |

### Resource navigation frame

`SettingsFrame` is the persistent navigation frame for an organization, project, team, or account. It contains the parent/back link, resource title, optional short description, and links to sibling pages. Keep the page title and short description in the page header, with page actions directly below its navigation. Keep page content and filters in the selected page. Do not add a third identity/metadata row or resource action menu to this frame. Omit tabs when the frame has no sibling destinations; do not show a lone `All` tab. Use `AccordionSection` for page subsections; do not add a second tab row inside a resource page. Dashboard pages do not show summary-stat cards.

`Shell.Main` `variant="dashboard"` uses `layoutContentClass`. The private layout `PageHeaderBar` aligns with the sidebar org switcher row.

Card, Frame, Table, and Dialog **internals** keep coss defaults (`p-6` on `CardHeader`, etc.); only **between** sections and **app chrome** use the sidebar scale.

## Layout primitives (coss)

| Component | Path |
|-----------|------|
| `Frame` (page/section layout) | `packages/ui/src/components/ui/frame.tsx` |
| `Sidebar*` | `packages/ui/src/components/ui/sidebar.tsx` |

Use coss defaults for control density and visuals—avoid custom overrides on generated `ui/*` primitives except where `layout-spacing` documents app-level composition.

## Icons

Product concepts map to a single Lucide glyph in `apps/web/src/lib/icons.ts` (`appIcons`, `AppIconName`). Feature code should import icons through **`AppIcon`** (`components/patterns/app-icon.tsx`) or `appIcons` / `getAppIcon`, not ad-hoc `lucide-react` imports (exceptions: coss `ui/*` primitives, marketing pages, and spinners).

| Rule | Value |
|------|--------|
| Size | `size-4` (`iconMutedClassName`) |
| Tone | `text-muted-foreground` for inline/decorative icons |
| Spacing | Pair with labels using coss default **`gap-2`** on flex rows (buttons, sheet titles, settings rows) |
| Tables | Leading avatar or `AppIcon` in the primary column (`TableLeadingCell`); row menus use `rowActions` + tooltip |
| Status | `StatusBadge` (outline `sm` + colored dot via coss tokens); `VisibilityBadge` (outline + globe/lock); `RoleBadge` (secondary `sm`); audit columns use `AuditActionBadge` / `AuditEntityBadge` |
| Links | `github`, `externalLink` with tooltips on outline buttons |
| Settings | `SettingsSectionHeader` / `SettingsRow` optional `icon` prop; danger sections use `danger` |
| Sheets | `FormSheet` + `SheetTitleWithIcon`; full viewport height, scrollable body |

When an icon sits on a filled button, pass `className="text-current"` on `AppIcon` so it inherits button foreground color.

## Sheets (FormSheet)

Use `FormSheet` / `FormSheetPopup` / `FormSheetHeader` / `FormSheetForm` / `FormSheetBody` / `FormSheetFooter` from `components/patterns/form-sheet.tsx` for every inset sheet (create/edit flows, org settings, onboarding, mobile sidebar shell).

| Requirement | Implementation |
|-------------|----------------|
| Horizontal padding | Coss defaults only — `SheetHeader` / `SheetFooter` / body use matching `px-6` via `formSheetPanelPaddingClass` (do not add `layoutGutterClass` on panels) |
| Full viewport height | `formSheetPopupClassName` (`h-full` inset panel) |
| Scroll | `FormSheetBody` → `ScrollArea` with `flex-1 min-h-0`; fields in `grid gap-2` inside |
| Footer | `FormSheetFooter` with `shrink-0` |

Avoid `form className="contents"` on sheets — it breaks the flex column layout.

## Charts

No chart primitive is shipped today; if charts return, add the Recharts wrapper to `packages/ui/src/components/ui/chart.tsx` (not part of coss ui; keep it free of Radix).

## Verification

```bash
cd apps/web
rg -n 'radix-ui|@radix-ui' --glob '!node_modules'   # expect no matches
rg -n '\b(gap-6|md:p-6)\b' src/domain src/app --glob '!**/ui/**'   # expect no matches (use layout-spacing)
pnpm build
pnpm test
```
