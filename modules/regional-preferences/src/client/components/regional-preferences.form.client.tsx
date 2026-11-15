"use client"

import { FormKit } from "@features/form"
import { defaultSupportedLocales } from "@features/i18n/constants"
import { buildPathnamePreservingBrowserQuery } from "@features/i18n/pathname"
import { useShellNavigation } from "@features/shell"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { useQuery, useQueryClient } from "@packages/react-query"
import { toastManager } from "@packages/ui/components/toast"
import { hasLocale, useFormatter, useTranslations } from "next-intl"
import { z } from "zod"
import { useBrowserRegionalDefaults } from "../hooks/regional-preferences.browser-defaults.client"
import { RegionalFieldHint } from "./regional-preferences.form.hint"
import { RegionalMeasurementField } from "./regional-preferences.form.measurements-field"
import {
  buildCurrencyOptions,
  buildDateStyleOptions,
  buildHourCycleOptions,
  buildLanguageOptions,
  buildMeasurementOptions,
  buildNumberGroupingOptions,
  buildRegionOptions,
} from "./regional-preferences.form.options"
import { RegionalPreferencePreview } from "./regional-preferences.form.preview"
import {
  parseRegionalFormUpdate,
  regionalSaveErrorMessage,
} from "./regional-preferences.form.save"
import { RegionalFormBodySkeleton } from "./regional-preferences.form.skeleton"
import { RegionalTimezoneField } from "./regional-preferences.form.timezone-field"
import { RegionalPreferencesFrame } from "./regional-preferences.frame"
import type { RegionalFormSection } from "./regional-preferences.layout"
import { regionalFormBodyMinHeightClass } from "./regional-preferences.layout"
import { RegionalLoadError } from "./regional-preferences.load-error.client"

const formSchema = z.object({
  value: z.string(),
  extra: z.string(),
  hourCycle: z.string(),
})
type Section = RegionalFormSection

function FieldLabelWithHint({
  hint,
  hintAria,
  label,
}: {
  readonly hint: string
  readonly hintAria: string
  readonly label: string
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <RegionalFieldHint ariaLabel={hintAria} body={hint} />
    </span>
  )
}

export function AuthAccountRegionalForm({
  section,
}: {
  readonly section: Section
}) {
  const t = useTranslations("regionalPreferences")
  const format = useFormatter()
  const { usePathname, useRouter } = useShellNavigation()
  const router = useRouter()
  const pathname = usePathname()
  const browserDefaults = useBrowserRegionalDefaults()
  const { data: session, isPending } = authClient.useSession()
  const queryClient = useQueryClient()
  const userId = session?.user.id
  const queryKey = ["regionalPreferences", userId]
  const query = useQuery({
    queryKey,
    enabled: Boolean(userId),
    queryFn: async () => {
      const result = await securityRpc.security.regionalPreferences.get()
      if (result.status !== "success") throw new Error(t("loadError"))
      return result.data
    },
  })
  const sectionCopy = {
    language: {
      title: t("language"),
      description: t("languageDescription"),
    },
    region: {
      title: t("region"),
      description: t("regionDescription"),
    },
    "date-time": {
      title: t("dateTimeSection"),
      description: t("dateTimeDescription"),
    },
    currency: {
      title: t("currency"),
      description: t("currencyDescription"),
    },
    numbers: {
      title: t("grouping"),
      description: t("numberDescription"),
    },
    measurements: {
      title: t("measurementSystem"),
      description: t("measurementDescription"),
    },
  } satisfies Record<Section, { description: string; title: string }>

  const frame = sectionCopy[section]

  const bodyMinClass = regionalFormBodyMinHeightClass[section]

  if (isPending || (userId && query.isPending && !query.data)) {
    return (
      <RegionalPreferencesFrame
        description={frame.description}
        title={frame.title}
      >
        <RegionalFormBodySkeleton section={section} />
      </RegionalPreferencesFrame>
    )
  }
  if (!userId) {
    return (
      <RegionalPreferencesFrame
        description={frame.description}
        title={frame.title}
      >
        <div className={bodyMinClass}>
          <p className="text-sm text-muted-foreground">{t("loadError")}</p>
        </div>
      </RegionalPreferencesFrame>
    )
  }
  if (query.isError || !query.data) {
    return (
      <RegionalPreferencesFrame
        description={frame.description}
        title={frame.title}
      >
        <RegionalLoadError
          className={`flex flex-col items-start justify-center gap-3 rounded-lg border border-border bg-muted/20 p-4 ${bodyMinClass}`}
          message={t("loadError")}
          onRetry={() => {
            void query.refetch()
          }}
        />
      </RegionalPreferencesFrame>
    )
  }
  const prefs = query.data
  const fields = {
    language: {
      ...sectionCopy.language,
      value: prefs.language,
      field: "language",
    },
    region: {
      ...sectionCopy.region,
      value: prefs.region,
      field: "region",
    },
    "date-time": {
      ...sectionCopy["date-time"],
      value: prefs.timeZone,
      field: "timeZone",
    },
    currency: {
      ...sectionCopy.currency,
      value: prefs.currency,
      field: "currency",
    },
    numbers: {
      ...sectionCopy.numbers,
      value: prefs.numberGrouping,
      field: "numberGrouping",
    },
    measurements: {
      ...sectionCopy.measurements,
      value: prefs.measurementSystem,
      field: "measurementSystem",
    },
  } satisfies Record<
    Section,
    { title: string; description: string; value: string | null; field: string }
  >
  const config = fields[section]

  const languageOptions = buildLanguageOptions(t("notSet"))
  const automaticRegionLabel = browserDefaults?.region
    ? t("automaticValue", {
        value:
          format.displayName(browserDefaults.region, "region") ??
          browserDefaults.region,
      })
    : t("automatic")
  const automaticTimeZoneLabel = browserDefaults?.timeZone
    ? t("automaticValue", { value: browserDefaults.timeZone })
    : t("automatic")
  const regionOptions = buildRegionOptions(format, automaticRegionLabel)
  const currencyOptions = buildCurrencyOptions(format, t("notSet"))
  const numberOptions = buildNumberGroupingOptions(
    t("notSet"),
    t("automatic"),
    t("noGrouping")
  )
  const measurementOptions = buildMeasurementOptions(
    t("notSet"),
    t("measurementNotSetDescription"),
    t("metric"),
    t("metricExample"),
    t("usCustomary"),
    t("usCustomaryExample"),
    t("ukSystem"),
    t("ukSystemExample")
  )
  const extraOptions = buildDateStyleOptions(
    t("notSet"),
    t("short"),
    t("medium"),
    t("long")
  )
  const hourCycleOptions = buildHourCycleOptions(
    t("notSet"),
    t("hours12"),
    t("hours24")
  )

  async function save(values: z.infer<typeof formSchema>) {
    const parsed = parseRegionalFormUpdate(section, values)
    if (!parsed.success) throw new Error(t("invalid"))
    await toastManager.promise(
      (async () => {
        const result = await securityRpc.security.regionalPreferences.update({
          payload: parsed.data,
        })
        const failure = regionalSaveErrorMessage(
          result,
          t("invalid"),
          t("saveError"),
          parsed
        )
        if (failure) throw new Error(failure)
        queryClient.setQueryData(queryKey, result.data)
        await queryClient.invalidateQueries({
          queryKey: ["regionalPreferences"],
        })
        if (
          section === "language" &&
          values.value &&
          hasLocale(defaultSupportedLocales, values.value)
        ) {
          router.replace(buildPathnamePreservingBrowserQuery(pathname), {
            locale: values.value,
          })
        } else router.refresh()
      })(),
      { loading: t("saving"), success: t("saved"), error: t("saveError") }
    )
  }

  const defaultValues = {
    value: config.value ?? "",
    extra: prefs.dateStyle ?? "",
    hourCycle: prefs.hourCycle ?? "",
  }

  function renderFields() {
    if (section === "language") {
      return (
        <FormKit.Section title={t("language")}>
          <div className="space-y-4">
            <FormKit.Field
              type="combobox"
              name="value"
              showClear
              label={
                <FieldLabelWithHint
                  hint={t("languageHint")}
                  hintAria={t("languageHintAria")}
                  label={t("language")}
                />
              }
              description={t("languageDescription")}
              options={languageOptions}
              placeholder={t("searchLanguage")}
            />
            <RegionalPreferencePreview section={section} />
          </div>
        </FormKit.Section>
      )
    }
    if (section === "region") {
      return (
        <FormKit.Section title={t("region")}>
          <div className="space-y-4">
            <FormKit.Field
              type="combobox"
              name="value"
              showClear
              label={
                <FieldLabelWithHint
                  hint={t("regionHint")}
                  hintAria={t("regionHintAria")}
                  label={t("region")}
                />
              }
              description={t("regionDescription")}
              options={regionOptions}
              placeholder={t("searchRegion")}
            />
            <RegionalPreferencePreview section={section} />
          </div>
        </FormKit.Section>
      )
    }
    if (section === "currency") {
      return (
        <FormKit.Section title={t("currency")}>
          <div className="space-y-4">
            <FormKit.Field
              type="combobox"
              name="value"
              showClear
              label={
                <FieldLabelWithHint
                  hint={t("currencyHint")}
                  hintAria={t("currencyHintAria")}
                  label={t("currency")}
                />
              }
              description={t("currencyDescription")}
              options={currencyOptions}
              placeholder={t("searchCurrency")}
            />
            <RegionalPreferencePreview section={section} />
          </div>
        </FormKit.Section>
      )
    }
    if (section === "numbers") {
      return (
        <FormKit.Section title={t("grouping")}>
          <div className="space-y-4">
            <FormKit.Field
              type="segmented"
              name="value"
              label={
                <FieldLabelWithHint
                  hint={t("numberHint")}
                  hintAria={t("numberHintAria")}
                  label={t("grouping")}
                />
              }
              description={t("numberDescription")}
              options={numberOptions}
            />
            <RegionalPreferencePreview section={section} />
          </div>
        </FormKit.Section>
      )
    }
    if (section === "measurements") {
      return (
        <FormKit.Section title={t("measurementSystem")}>
          <div className="space-y-4">
            <RegionalMeasurementField
              label={
                <FieldLabelWithHint
                  hint={t("measurementHint")}
                  hintAria={t("measurementHintAria")}
                  label={t("measurementSystem")}
                />
              }
              description={t("measurementDescription")}
              options={measurementOptions}
            />
            <RegionalPreferencePreview section={section} />
          </div>
        </FormKit.Section>
      )
    }
    return (
      <>
        <FormKit.Section title={t("timeZone")}>
          <RegionalTimezoneField
            label={
              <FieldLabelWithHint
                hint={t("timeZoneHint")}
                hintAria={t("timeZoneHintAria")}
                label={t("timeZone")}
              />
            }
            description={t("timeZoneDescription")}
            notSetLabel={automaticTimeZoneLabel}
            placeholder={t("searchTimeZone")}
          />
        </FormKit.Section>
        <FormKit.Section title={t("dateStyle")}>
          <FormKit.Field
            type="segmented"
            name="extra"
            label={
              <FieldLabelWithHint
                hint={t("dateStyleHint")}
                hintAria={t("dateStyleHintAria")}
                label={t("dateStyle")}
              />
            }
            options={extraOptions}
          />
        </FormKit.Section>
        <FormKit.Section title={t("hourCycle")}>
          <FormKit.Field
            type="segmented"
            name="hourCycle"
            label={
              <FieldLabelWithHint
                hint={t("hourCycleHint")}
                hintAria={t("hourCycleHintAria")}
                label={t("hourCycle")}
              />
            }
            options={hourCycleOptions}
          />
        </FormKit.Section>
        <FormKit.Section title={t("previewLabel")}>
          <RegionalPreferencePreview section="date-time" />
        </FormKit.Section>
      </>
    )
  }

  return (
    <RegionalPreferencesFrame
      description={config.description}
      title={config.title}
    >
      <div className={bodyMinClass}>
        <FormKit
          key={`${section}:${JSON.stringify(prefs)}`}
          variant="embedded"
          schema={formSchema}
          defaultValues={defaultValues}
          onSubmit={save}
        >
          {renderFields()}
          <FormKit.Actions>
            <FormKit.Reset />
            <FormKit.Submit />
          </FormKit.Actions>
        </FormKit>
      </div>
    </RegionalPreferencesFrame>
  )
}
