"use client"

import { FormKit } from "@features/form"
import type { AppearancePreferences } from "@modules/appearance-preferences/utils"
import { AuthSessionEndedNotice } from "@modules/auth"
import { RegionalLoadError } from "@modules/regional-preferences/client"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { useQuery } from "@packages/react-query"
import type { LucideIcon } from "lucide-react"
import { LayoutGrid, Palette, PanelLeft, ZoomIn } from "lucide-react"
import { useTranslations } from "next-intl"
import {
  displayDensityPreference,
  displaySidebarPreference,
  displayThemePreference,
  displayZoomPreference,
} from "./appearance-preferences.display"
import { AppearancePreferencesFrame } from "./appearance-preferences.frame"
import { appearanceOverviewBodyMinHeightClass } from "./appearance-preferences.layout"
import {
  AppearanceOverviewField,
  AppearanceOverviewFieldGrid,
  AppearanceOverviewFieldsSkeleton,
} from "./appearance-preferences.overview.fields"
import { appearanceOverviewPreview } from "./appearance-preferences.overview-preview"

type FieldConfig = {
  fieldId: string
  hintKey:
    | "overviewThemeDetail"
    | "overviewZoomDetail"
    | "overviewDensityDetail"
    | "overviewSidebarDetail"
  href: string
  icon: LucideIcon
  labelKey: "theme" | "interfaceDensity" | "sidebarBehavior" | "zoomLevel"
}

const APPEARANCE_FIELDS: FieldConfig[] = [
  {
    fieldId: "overview-theme",
    hintKey: "overviewThemeDetail",
    href: "/account/appearance/theme",
    icon: Palette,
    labelKey: "theme",
  },
  {
    fieldId: "overview-zoom",
    hintKey: "overviewZoomDetail",
    href: "/account/appearance/zoom",
    icon: ZoomIn,
    labelKey: "zoomLevel",
  },
  {
    fieldId: "overview-density",
    hintKey: "overviewDensityDetail",
    href: "/account/appearance/density",
    icon: LayoutGrid,
    labelKey: "interfaceDensity",
  },
  {
    fieldId: "overview-sidebar",
    hintKey: "overviewSidebarDetail",
    href: "/account/appearance/sidebar",
    icon: PanelLeft,
    labelKey: "sidebarBehavior",
  },
]

function displayForField(
  href: string,
  prefs: AppearancePreferences,
  deps: {
    t: ReturnType<typeof useTranslations<"appearancePreferences">>
    tUi: ReturnType<typeof useTranslations<"ui">>
  }
) {
  switch (href) {
    case "/account/appearance/theme":
      return displayThemePreference(prefs, deps.t, deps.tUi)
    case "/account/appearance/zoom":
      return displayZoomPreference(prefs, deps.t)
    case "/account/appearance/density":
      return displayDensityPreference(prefs, deps.t)
    default:
      return displaySidebarPreference(prefs, deps.t)
  }
}

function AppearanceOverviewFieldSection({
  changeLabel,
  fields,
  highlightLabel,
  prefs,
  savedBadgeLabel,
  t,
  unsetBadgeLabel,
  displayDeps,
}: {
  readonly changeLabel: string
  readonly fields: FieldConfig[]
  readonly highlightLabel: string
  readonly prefs: AppearancePreferences
  readonly savedBadgeLabel: string
  readonly t: ReturnType<typeof useTranslations<"appearancePreferences">>
  readonly unsetBadgeLabel: string
  readonly displayDeps: {
    t: ReturnType<typeof useTranslations<"appearancePreferences">>
    tUi: ReturnType<typeof useTranslations<"ui">>
  }
}) {
  return (
    <AppearanceOverviewFieldGrid>
      {fields.map((field) => {
        const display = displayForField(field.href, prefs, displayDeps)
        const preview = appearanceOverviewPreview(field.href, prefs)
        return (
          <AppearanceOverviewField
            key={field.fieldId}
            changeHref={field.href}
            changeLabel={changeLabel}
            display={display}
            fieldId={field.fieldId}
            hint={t(field.hintKey)}
            highlightLabel={highlightLabel}
            icon={field.icon}
            label={t(field.labelKey)}
            previewAlt={t(field.labelKey)}
            previewPalette={preview?.palette}
            previewSrc={preview?.src ?? null}
            savedBadgeLabel={savedBadgeLabel}
            unsetBadgeLabel={unsetBadgeLabel}
          />
        )
      })}
    </AppearanceOverviewFieldGrid>
  )
}

export function AuthAccountAppearanceOverview() {
  const t = useTranslations("appearancePreferences")
  const tUi = useTranslations("ui")
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user.id
  const query = useQuery({
    queryKey: ["appearancePreferences", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const result = await securityRpc.security.appearancePreferences.get()
      if (result.status !== "success") throw new Error(t("loadError"))
      return result.data
    },
  })

  const changeLabel = t("change")
  const highlightLabel = t("previewRowSample")
  const savedBadgeLabel = t("overviewSaved")
  const unsetBadgeLabel = t("overviewUsingDefault")
  const panelTitle = tUi("overview")
  const panelDescription = t("overviewIntro")
  const displayDeps = { t, tUi }

  let panelBody: React.ReactNode

  if (sessionPending || (userId && query.isPending && !query.data)) {
    panelBody = (
      <div className={appearanceOverviewBodyMinHeightClass}>
        <FormKit.Section
          description={t("overviewAppearanceSectionDetail")}
          title={t("overviewGroupAppearance")}
        >
          <AppearanceOverviewFieldsSkeleton
            fieldIds={APPEARANCE_FIELDS.map((field) => field.fieldId)}
          />
        </FormKit.Section>
      </div>
    )
  } else if (!userId) {
    panelBody = (
      <div className={appearanceOverviewBodyMinHeightClass}>
        <AuthSessionEndedNotice />
      </div>
    )
  } else if (query.isError || !query.data) {
    panelBody = (
      <RegionalLoadError
        className={appearanceOverviewBodyMinHeightClass}
        message={t("loadError")}
        onRetry={() => {
          void query.refetch()
        }}
      />
    )
  } else {
    const prefs = query.data
    panelBody = (
      <>
        <p className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
          <Palette className="size-4 shrink-0" aria-hidden="true" />
          {t("overviewStatus")}
        </p>
        <FormKit.Section
          description={t("overviewAppearanceSectionDetail")}
          title={t("overviewGroupAppearance")}
        >
          <AppearanceOverviewFieldSection
            changeLabel={changeLabel}
            displayDeps={displayDeps}
            fields={APPEARANCE_FIELDS}
            highlightLabel={highlightLabel}
            prefs={prefs}
            savedBadgeLabel={savedBadgeLabel}
            t={t}
            unsetBadgeLabel={unsetBadgeLabel}
          />
        </FormKit.Section>
      </>
    )
  }

  return (
    <AppearancePreferencesFrame
      description={panelDescription}
      title={panelTitle}
    >
      <div className="flex w-full flex-col gap-2">{panelBody}</div>
    </AppearancePreferencesFrame>
  )
}
