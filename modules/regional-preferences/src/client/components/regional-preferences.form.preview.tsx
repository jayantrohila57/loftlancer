"use client"

import {
  defaultLocaleLabels,
  defaultSupportedLocales,
} from "@features/i18n/constants"
import { CalendarClock, Globe, Hash, Ruler, Wallet } from "lucide-react"
import {
  hasLocale,
  useFormatter,
  useLocale,
  useTimeZone,
  useTranslations,
} from "next-intl"
import { useFormContext, useWatch } from "react-hook-form"
import { useBrowserRegionalDefaults } from "../hooks/regional-preferences.browser-defaults.client"
import {
  previewCurrencyOptions,
  previewDateTimeOptions,
} from "./regional-preferences.preview.utils"

type Section =
  | "language"
  | "region"
  | "date-time"
  | "currency"
  | "numbers"
  | "measurements"

type RegionalFormValues = {
  value: string
  extra: string
  hourCycle: string
}

function PreviewPanel({
  children,
  icon,
  title,
}: {
  readonly children: React.ReactNode
  readonly icon: React.ReactNode
  readonly title: string
}) {
  return (
    <div
      className="rounded-lg border border-border bg-muted/40 p-4 text-sm"
      role="status"
    >
      <div className="mb-3 flex items-center gap-2 font-medium text-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <dl className="space-y-2">{children}</dl>
    </div>
  )
}

function PreviewRow({
  term,
  value,
}: {
  readonly term: string
  readonly value: React.ReactNode
}) {
  return (
    <div className="grid gap-0.5 sm:grid-cols-[minmax(7rem,9rem)_1fr] sm:gap-3">
      <dt className="text-muted-foreground">{term}</dt>
      <dd className="min-w-0 text-foreground">{value}</dd>
    </div>
  )
}

function dateStyleLabel(
  extra: string,
  t: ReturnType<typeof useTranslations<"regionalPreferences">>
) {
  if (extra === "short") return t("short")
  if (extra === "medium") return t("medium")
  if (extra === "long") return t("long")
  return t("notSet")
}

export function RegionalPreferencePreview({
  section,
}: {
  readonly section: Section
}) {
  const t = useTranslations("regionalPreferences")
  const format = useFormatter()
  const pageLocale = useLocale()
  const activeTimeZone = useTimeZone()
  const browserDefaults = useBrowserRegionalDefaults()
  const { control } = useFormContext<RegionalFormValues>()
  const value = useWatch({ control, name: "value" })
  const extra = useWatch({ control, name: "extra" })
  const hourCycle = useWatch({ control, name: "hourCycle" })
  const previewTitle = t("previewLabel")
  const now = new Date("2026-06-15T12:30:00Z")
  const selectionLabel = value
    ? t("previewChoiceSaved")
    : t("previewChoiceDefault")

  if (section === "language") {
    const tag =
      value && hasLocale(defaultSupportedLocales, value) ? value : pageLocale
    const languageTag = tag.split("-")[0] ?? tag
    const languageName = format.displayName(languageTag, "language")
    const friendly =
      hasLocale(defaultSupportedLocales, tag) && defaultLocaleLabels[tag]
        ? defaultLocaleLabels[tag]
        : tag
    const sample = format.dateTime(now, "dateTime")
    return (
      <PreviewPanel
        icon={<Globe className="size-4" aria-hidden />}
        title={previewTitle}
      >
        <PreviewRow term={t("previewRowChoice")} value={selectionLabel} />
        <PreviewRow term={t("language")} value={friendly} />
        <PreviewRow
          term={t("previewLocaleTag")}
          value={<span className="font-mono text-xs">{tag}</span>}
        />
        <PreviewRow term={t("previewRowDisplayName")} value={languageName} />
        <PreviewRow
          term={t("previewRowSample")}
          value={<span className="tabular-nums">{sample}</span>}
        />
        <PreviewRow term={t("previewRowNote")} value={t("previewLanguage")} />
      </PreviewPanel>
    )
  }

  if (section === "region") {
    const region =
      value ||
      browserDefaults?.region ||
      pageLocale.split("-")[1]?.toUpperCase()
    const name = region ? format.displayName(region, "region") : t("notSet")
    return (
      <PreviewPanel
        icon={<Globe className="size-4" aria-hidden />}
        title={previewTitle}
      >
        <PreviewRow term={t("previewRowChoice")} value={selectionLabel} />
        <PreviewRow term={t("region")} value={name} />
        <PreviewRow
          term={t("previewRegionCode")}
          value={
            <span className="font-mono text-xs">{region ?? t("notSet")}</span>
          }
        />
        <PreviewRow term={t("previewRowNote")} value={t("previewRegion")} />
      </PreviewPanel>
    )
  }

  if (section === "currency") {
    const code = value
    const options = previewCurrencyOptions(code)
    const formatted = options ? format.number(1234.56, options) : t("notSet")
    const small = options ? format.number(9.99, options) : t("notSet")
    return (
      <PreviewPanel
        icon={<Wallet className="size-4" aria-hidden />}
        title={previewTitle}
      >
        <PreviewRow term={t("previewRowChoice")} value={selectionLabel} />
        <PreviewRow
          term={t("previewCurrencyCode")}
          value={
            <span className="font-mono text-xs">{code || t("notSet")}</span>
          }
        />
        <PreviewRow
          term={t("previewRowExampleLarge")}
          value={<span className="tabular-nums">{formatted}</span>}
        />
        <PreviewRow
          term={t("previewRowExampleSmall")}
          value={<span className="tabular-nums">{small}</span>}
        />
        <PreviewRow term={t("previewRowNote")} value={t("previewCurrency")} />
      </PreviewPanel>
    )
  }

  if (section === "numbers") {
    const useGrouping = value !== "never"
    const groupingLabel =
      value === "never"
        ? t("noGrouping")
        : value === "auto"
          ? t("automatic")
          : value === ""
            ? t("notSet")
            : t("automatic")
    const large = format.number(1_234_567.89, {
      useGrouping: value === "" ? true : useGrouping,
    })
    const compact = format.number(999, {
      useGrouping: value === "" ? true : useGrouping,
    })
    return (
      <PreviewPanel
        icon={<Hash className="size-4" aria-hidden />}
        title={previewTitle}
      >
        <PreviewRow term={t("previewRowChoice")} value={selectionLabel} />
        <PreviewRow term={t("grouping")} value={groupingLabel} />
        <PreviewRow
          term={t("previewRowExampleLarge")}
          value={<span className="tabular-nums">{large}</span>}
        />
        <PreviewRow
          term={t("previewRowExampleSmall")}
          value={<span className="tabular-nums">{compact}</span>}
        />
        <PreviewRow term={t("previewRowNote")} value={t("previewNumber")} />
      </PreviewPanel>
    )
  }

  if (section === "measurements") {
    const systemLabel =
      value === "metric"
        ? t("metric")
        : value === "us"
          ? t("usCustomary")
          : value === "uk"
            ? t("ukSystem")
            : t("notSet")
    const sampleKey =
      value === "metric"
        ? "previewMetricSamples"
        : value === "us"
          ? "previewUsSamples"
          : value === "uk"
            ? "previewUkSamples"
            : "previewMeasurementDefault"
    return (
      <PreviewPanel
        icon={<Ruler className="size-4" aria-hidden />}
        title={previewTitle}
      >
        <PreviewRow term={t("previewRowChoice")} value={selectionLabel} />
        <PreviewRow term={t("measurementSystem")} value={systemLabel} />
        <PreviewRow term={t("previewRowSamples")} value={t(sampleKey)} />
        <PreviewRow
          term={t("previewRowNote")}
          value={t("previewMeasurement")}
        />
      </PreviewPanel>
    )
  }

  const selectedZone = value || activeTimeZone || "UTC"
  const previewOptions = previewDateTimeOptions(selectedZone, extra, hourCycle)
  const dateLine = format.dateTime(now, previewOptions.date)
  const timeLine = format.dateTime(now, previewOptions.time)
  const hourCycleLabel =
    hourCycle === "h12"
      ? t("hours12")
      : hourCycle === "h23"
        ? t("hours24")
        : t("notSet")
  const styleLabel = dateStyleLabel(extra, t)

  return (
    <PreviewPanel
      icon={<CalendarClock className="size-4" aria-hidden />}
      title={previewTitle}
    >
      <PreviewRow
        term={t("timeZone")}
        value={selectedZone.replaceAll("_", " ")}
      />
      <PreviewRow term={t("dateStyle")} value={styleLabel} />
      <PreviewRow term={t("hourCycle")} value={hourCycleLabel} />
      <PreviewRow
        term={t("previewRowSample")}
        value={
          <span className="tabular-nums">
            {t("previewDateTime", { date: dateLine, time: timeLine })}
          </span>
        }
      />
      <PreviewRow term={t("previewRowNote")} value={t("dateTimeDescription")} />
    </PreviewPanel>
  )
}
