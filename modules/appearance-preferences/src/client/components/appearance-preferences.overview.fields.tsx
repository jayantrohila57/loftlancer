"use client"

import type {
  AppearancePreviewPalette,
  AppearancePreviewSrc,
} from "@features/form"
import { AppearancePreviewImage } from "@features/form"
import { useShellNavigation } from "@features/shell"
import { Badge } from "@packages/ui/components/badge"
import { Button } from "@packages/ui/components/button"
import { Skeleton } from "@packages/ui/components/skeleton"
import type { LucideIcon } from "lucide-react"
import { ArrowUpRight } from "lucide-react"
import type { AppearancePreferenceRowDisplay } from "./appearance-preferences.display"
import { appearanceOverviewCardHeightClass } from "./appearance-preferences.layout"

function DetailValue({
  value,
  variant = "default",
}: {
  readonly value: string
  readonly variant?: "default" | "emphasis" | "mono"
}) {
  if (variant === "mono") {
    return <span className="font-mono text-xs text-foreground">{value}</span>
  }
  if (variant === "emphasis") {
    return <span className="font-medium text-foreground">{value}</span>
  }
  return <span className="text-foreground">{value}</span>
}

export function AppearanceOverviewFieldGrid({
  children,
}: {
  readonly children: React.ReactNode
}) {
  return <div className="flex w-full flex-col gap-4">{children}</div>
}

export function AppearanceOverviewField({
  changeHref,
  changeLabel,
  display,
  fieldId,
  hint,
  highlightLabel,
  icon: Icon,
  label,
  previewAlt,
  previewPalette,
  previewSrc,
  savedBadgeLabel,
  unsetBadgeLabel,
}: {
  readonly changeHref: string
  readonly changeLabel: string
  readonly display: AppearancePreferenceRowDisplay
  readonly fieldId: string
  readonly hint?: string
  readonly highlightLabel: string
  readonly icon: LucideIcon
  readonly label: string
  readonly previewAlt: string
  readonly previewPalette?: AppearancePreviewPalette
  readonly previewSrc: AppearancePreviewSrc | null
  readonly savedBadgeLabel: string
  readonly unsetBadgeLabel: string
}) {
  const { Link } = useShellNavigation()
  const statusLabel = display.isUnset ? unsetBadgeLabel : savedBadgeLabel

  return (
    <article
      aria-labelledby={`${fieldId}-title`}
      className="flex h-full flex-col rounded-xl border border-border bg-muted/25 shadow-xs/5"
    >
      <header className="flex items-start gap-3 border-b border-border/80 px-4 py-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-border bg-background">
          <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <h3
              className="text-sm font-semibold text-foreground"
              id={`${fieldId}-title`}
            >
              {label}
            </h3>
            {display.isUnset ? (
              <span className="text-xs text-muted-foreground">
                {statusLabel}
              </span>
            ) : (
              <Badge className="shrink-0" variant="success">
                {statusLabel}
              </Badge>
            )}
          </div>
          {hint ? (
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              {hint}
            </p>
          ) : null}
        </div>
        <Button
          className="shrink-0"
          render={<Link href={changeHref} />}
          size="sm"
          variant="outline"
        >
          {changeLabel}
          <ArrowUpRight className="size-4" aria-hidden="true" />
        </Button>
      </header>

      <div
        className={
          previewSrc
            ? "grid flex-1 gap-4 px-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch sm:gap-0"
            : "px-4 py-3"
        }
      >
        <dl className="min-w-0 space-y-2 text-sm">
          {display.details.map((row) => (
            <div
              key={`${fieldId}-${row.label}`}
              className="grid gap-0.5 sm:grid-cols-[minmax(6.5rem,8.5rem)_1fr] sm:items-baseline sm:gap-2"
            >
              <dt className="text-muted-foreground">{row.label}</dt>
              <dd className="min-w-0 text-muted-foreground">
                <DetailValue
                  value={row.value}
                  variant={row.variant === "mono" ? "mono" : "default"}
                />
              </dd>
            </div>
          ))}
        </dl>

        {previewSrc ? (
          <>
            <p
              aria-hidden="true"
              className="hidden bg-border sm:mx-4 sm:block sm:w-px sm:self-stretch"
            />
            <div
              aria-hidden="true"
              className="h-px w-full bg-border sm:hidden"
            />
            <section
              aria-labelledby={`${fieldId}-example`}
              className="flex min-w-0 flex-col sm:px-4"
            >
              <h4
                className="text-xs font-medium text-muted-foreground"
                id={`${fieldId}-example`}
              >
                {highlightLabel}
              </h4>
              <AppearancePreviewImage
                alt={previewAlt}
                className="mt-2 w-full shadow-none"
                palette={previewPalette}
                src={previewSrc}
              />
            </section>
          </>
        ) : null}
      </div>
    </article>
  )
}

export function AppearanceOverviewFieldsSkeleton({
  fieldIds,
}: {
  readonly fieldIds: readonly string[]
}) {
  return (
    <AppearanceOverviewFieldGrid>
      {fieldIds.map((id) => (
        <Skeleton
          key={id}
          className={`w-full rounded-xl ${appearanceOverviewCardHeightClass}`}
        />
      ))}
    </AppearanceOverviewFieldGrid>
  )
}
