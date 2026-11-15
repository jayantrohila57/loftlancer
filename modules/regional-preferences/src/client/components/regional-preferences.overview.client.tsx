"use client"

import { FormKit } from "@features/form"
import { AuthSessionEndedNotice } from "@modules/auth"
import type { RegionalPreferences } from "@modules/regional-preferences/utils"
import { securityRpc } from "@modules/security/client"
import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import { authClient } from "@packages/better-auth/client"
import { useQuery } from "@packages/react-query"
import Shell from "@packages/ui/components/shell"
import type { LucideIcon } from "lucide-react"
import {
  CalendarClock,
  Coins,
  Globe,
  Hash,
  Languages,
  MapPin,
  Ruler,
} from "lucide-react"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import {
  displayCurrencyPreference,
  displayDateTimePreference,
  displayLanguagePreference,
  displayMeasurementPreference,
  displayNumberGroupingPreference,
  displayRegionPreference,
} from "./regional-preferences.display"
import { regionalOverviewBodyMinHeightClass } from "./regional-preferences.layout"
import { RegionalLoadError } from "./regional-preferences.load-error.client"
import { RegionalOverviewFaq } from "./regional-preferences.overview.faq"
import {
  RegionalOverviewField,
  RegionalOverviewFieldGrid,
} from "./regional-preferences.overview.fields"
import { RegionalOverviewBodySkeleton } from "./regional-preferences.overview.skeleton"

type FieldConfig = {
  fieldId: string
  hintKey:
    | "overviewLanguageDetail"
    | "overviewRegionDetail"
    | "overviewDateTimeDetail"
    | "overviewNumbersDetail"
    | "overviewCurrencyDetail"
    | "overviewMeasurementDetail"
  href: string
  icon: LucideIcon
  labelKey:
    | "language"
    | "region"
    | "dateAndTime"
    | "numbers"
    | "currency"
    | "measurements"
}

const LOCALE_FIELDS: FieldConfig[] = [
  {
    fieldId: "overview-language",
    hintKey: "overviewLanguageDetail",
    href: "/account/language-region/language",
    icon: Languages,
    labelKey: "language",
  },
  {
    fieldId: "overview-region",
    hintKey: "overviewRegionDetail",
    href: "/account/language-region/region",
    icon: MapPin,
    labelKey: "region",
  },
]

const FORMAT_FIELDS: FieldConfig[] = [
  {
    fieldId: "overview-date-time",
    hintKey: "overviewDateTimeDetail",
    href: "/account/language-region/date-time",
    icon: CalendarClock,
    labelKey: "dateAndTime",
  },
  {
    fieldId: "overview-numbers",
    hintKey: "overviewNumbersDetail",
    href: "/account/language-region/numbers",
    icon: Hash,
    labelKey: "numbers",
  },
  {
    fieldId: "overview-currency",
    hintKey: "overviewCurrencyDetail",
    href: "/account/language-region/currency",
    icon: Coins,
    labelKey: "currency",
  },
  {
    fieldId: "overview-measurements",
    hintKey: "overviewMeasurementDetail",
    href: "/account/language-region/measurements",
    icon: Ruler,
    labelKey: "measurements",
  },
]

function displayForField(
  href: string,
  prefs: RegionalPreferences,
  deps: {
    format: ReturnType<typeof useFormatter>
    pageLocale: ReturnType<typeof useLocale>
    t: ReturnType<typeof useTranslations<"regionalPreferences">>
  }
) {
  switch (href) {
    case "/account/language-region/language":
      return displayLanguagePreference(
        prefs,
        deps.pageLocale,
        deps.format,
        deps.t
      )
    case "/account/language-region/region":
      return displayRegionPreference(prefs, deps.format, deps.t)
    case "/account/language-region/date-time":
      return displayDateTimePreference(prefs, deps.format, deps.t)
    case "/account/language-region/numbers":
      return displayNumberGroupingPreference(prefs, deps.format, deps.t)
    case "/account/language-region/currency":
      return displayCurrencyPreference(prefs, deps.format, deps.t)
    default:
      return displayMeasurementPreference(prefs, deps.t)
  }
}

function RegionalOverviewFieldGridSection({
  changeLabel,
  fields,
  highlightLabel,
  prefs,
  savedBadgeLabel,
  t,
  tUi,
  unsetBadgeLabel,
  displayDeps,
}: {
  readonly changeLabel: string
  readonly fields: FieldConfig[]
  readonly highlightLabel: string
  readonly prefs: RegionalPreferences
  readonly savedBadgeLabel: string
  readonly t: ReturnType<typeof useTranslations<"regionalPreferences">>
  readonly tUi: ReturnType<typeof useTranslations<"ui">>
  readonly unsetBadgeLabel: string
  readonly displayDeps: {
    format: ReturnType<typeof useFormatter>
    pageLocale: ReturnType<typeof useLocale>
    t: ReturnType<typeof useTranslations<"regionalPreferences">>
  }
}) {
  return (
    <RegionalOverviewFieldGrid>
      {fields.map((field) => {
        const display = displayForField(field.href, prefs, displayDeps)
        return (
          <RegionalOverviewField
            key={field.fieldId}
            changeHref={field.href}
            changeLabel={changeLabel}
            display={display}
            fieldId={field.fieldId}
            hint={t(field.hintKey)}
            highlightLabel={highlightLabel}
            icon={field.icon}
            label={tUi(field.labelKey)}
            savedBadgeLabel={savedBadgeLabel}
            unsetBadgeLabel={unsetBadgeLabel}
          />
        )
      })}
    </RegionalOverviewFieldGrid>
  )
}

function RegionalOverviewPanel({
  children,
  description,
  title,
}: {
  readonly children: React.ReactNode
  readonly description: string
  readonly title: string
}) {
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.regional"
          description={description}
          title={title}
        >
          <div className="flex w-full flex-col gap-2">{children}</div>
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}

export function AuthAccountRegionalOverview() {
  const t = useTranslations("regionalPreferences")
  const tUi = useTranslations("ui")
  const format = useFormatter()
  const pageLocale = useLocale()
  const { data: session, isPending: sessionPending } = authClient.useSession()
  const userId = session?.user.id
  const query = useQuery({
    queryKey: ["regionalPreferences", userId],
    enabled: Boolean(userId),
    queryFn: async () => {
      const result = await securityRpc.security.regionalPreferences.get()
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
  const displayDeps = { format, pageLocale, t }

  let panelBody: React.ReactNode

  if (sessionPending || (userId && query.isPending && !query.data)) {
    panelBody = (
      <RegionalOverviewBodySkeleton
        formatsSectionDescription={t("overviewFormatsSectionDetail")}
        formatsSectionTitle={t("overviewGroupFormats")}
        localeSectionDescription={t("overviewLocaleSectionDetail")}
        localeSectionTitle={t("overviewGroupLocale")}
      />
    )
  } else if (!userId) {
    panelBody = (
      <div className={regionalOverviewBodyMinHeightClass}>
        <AuthSessionEndedNotice />
      </div>
    )
  } else if (query.isError || !query.data) {
    panelBody = (
      <RegionalLoadError
        className={regionalOverviewBodyMinHeightClass}
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
          <Globe className="size-4 shrink-0" aria-hidden="true" />
          {t("overviewStatus")}
        </p>
        <FormKit.Section
          description={t("overviewLocaleSectionDetail")}
          title={t("overviewGroupLocale")}
        >
          <RegionalOverviewFieldGridSection
            changeLabel={changeLabel}
            displayDeps={displayDeps}
            fields={LOCALE_FIELDS}
            highlightLabel={highlightLabel}
            prefs={prefs}
            savedBadgeLabel={savedBadgeLabel}
            t={t}
            tUi={tUi}
            unsetBadgeLabel={unsetBadgeLabel}
          />
        </FormKit.Section>
        <FormKit.Section
          description={t("overviewFormatsSectionDetail")}
          title={t("overviewGroupFormats")}
        >
          <RegionalOverviewFieldGridSection
            changeLabel={changeLabel}
            displayDeps={displayDeps}
            fields={FORMAT_FIELDS}
            highlightLabel={highlightLabel}
            prefs={prefs}
            savedBadgeLabel={savedBadgeLabel}
            t={t}
            tUi={tUi}
            unsetBadgeLabel={unsetBadgeLabel}
          />
        </FormKit.Section>
      </>
    )
  }

  return (
    <>
      <RegionalOverviewPanel description={panelDescription} title={panelTitle}>
        {panelBody}
      </RegionalOverviewPanel>
      <RegionalOverviewFaq />
    </>
  )
}
