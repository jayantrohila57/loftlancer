"use client"

import type { ComboboxOption } from "@features/form"
import { callingCodeForRegion, FormKit, useFormKitFormId } from "@features/form"
import { withClientRetry } from "@modules/auth"
import { formatOrgClientError } from "@modules/org"
import { securityRpc } from "@modules/security/client"
import { authClient } from "@packages/better-auth/client"
import { Button } from "@packages/ui/components/button"
import { toastManager } from "@packages/ui/components/toast"
import { useFormatter, useLocale, useTranslations } from "next-intl"
import { useEffect, useMemo, useRef } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import type { z } from "zod"
import {
  buildStudioOnboardingCountryOptions,
  buildStudioOnboardingCurrencyOptions,
  buildStudioOnboardingLanguageOptions,
} from "@/shared/onboarding/studio-onboarding-organization-options.client"
import { studioOnboardingOrganizationSchema } from "@/shared/onboarding/studio-onboarding-organization-schema.client"
import type { studioOnboardingRegionalDefaultsFromDetected } from "@/shared/onboarding/studio-onboarding-setup.client"
import {
  buildStudioOnboardingSetupV2,
  getStudioOnboardingRegionalPlaceholderDefaults,
  studioOnboardingCurrencyForCountry,
  studioOnboardingTimezoneForCountry,
  useStudioOnboardingRegionalDefaults,
} from "@/shared/onboarding/studio-onboarding-setup.client"
import {
  StudioOnboardingSlugAutoFill,
  StudioOnboardingSlugField,
  StudioOnboardingSlugPreview,
} from "@/shared/onboarding/studio-onboarding-slug-fields.client"
import { studioAbsolutePath } from "@/shared/org/studio-org.paths"
import { StudioOnboardingPageFooter } from "@/shared/shell/studio-onboarding-page-footer"

type StudioOnboardingOrganizationValues = z.infer<
  ReturnType<typeof studioOnboardingOrganizationSchema>
>

async function resumeProvisioning() {
  try {
    await withClientRetry(async () => {
      const result = await securityRpc.security.org.provisioning.resume()
      if (result.status !== "success") {
        throw new Error(result.message)
      }
      return result.data
    })
  } catch {
    // Provisioning can be resumed later from billing or the create gate.
  }
}

function StudioOnboardingCreateSubmit() {
  const t = useTranslations("ui")
  const formId = useFormKitFormId()
  const {
    formState: { isSubmitting },
  } = useFormContext<StudioOnboardingOrganizationValues>()
  return (
    <Button type="submit" form={formId} loading={isSubmitting}>
      {isSubmitting ? t("creatingOrganization") : t("createOrganization")}
    </Button>
  )
}

function StudioOnboardingOrganizationTypeSection() {
  const t = useTranslations("ui")
  const organizationTypeOptions = useMemo(
    () =>
      [
        {
          value: "freelancer" as const,
          label: t("organizationTypeFreelancer"),
          description: t("organizationTypeFreelancerDescription"),
        },
        {
          value: "studio" as const,
          label: t("organizationTypeStudio"),
          description: t("organizationTypeStudioDescription"),
        },
        {
          value: "agency" as const,
          label: t("organizationTypeAgency"),
          description: t("organizationTypeAgencyDescription"),
        },
        {
          value: "company" as const,
          label: t("organizationTypeCompany"),
          description: t("organizationTypeCompanyDescription"),
        },
      ] as const,
    [t]
  )

  return (
    <FormKit.Section
      title={t("onboardingOrganizationTypeTitle")}
      description={t("onboardingOrganizationTypeDescription")}
    >
      <div className="[&_[data-slot=field]]:items-stretch [&_[data-slot=radio-group]]:grid [&_[data-slot=radio-group]]:w-full [&_[data-slot=radio-group]]:min-w-0 [&_[data-slot=radio-group]]:gap-4 [&_[data-slot=radio-group]]:md:grid-cols-2 [&_[data-slot=radio-group]>*]:w-full [&_[data-slot=radio-group]>*]:min-w-0">
        <FormKit.Field
          type="radio-group"
          name="type"
          label={t("organizationType")}
          options={[...organizationTypeOptions]}
          card
          required
        />
      </div>
    </FormKit.Section>
  )
}

function StudioOnboardingContactSection() {
  const t = useTranslations("ui")
  const { control } = useFormContext<StudioOnboardingOrganizationValues>()
  const countryCode = useWatch({ control, name: "location.countryCode" })
  const defaultCallingCode = useMemo(
    () => callingCodeForRegion(countryCode),
    [countryCode]
  )

  return (
    <FormKit.Section
      title={t("onboardingOrganizationContactTitle")}
      description={t("onboardingOrganizationContactDescription")}
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormKit.Field
          type="email"
          name="contact.primaryEmail"
          label={t("organizationPrimaryEmail")}
          description={t("organizationPrimaryEmailDescription")}
          required
        />
        <FormKit.Field
          type="tel"
          name="contact.businessPhone"
          label={t("organizationBusinessPhoneOptional")}
          description={t("organizationOptionalWizardFieldDescription")}
          defaultCallingCode={defaultCallingCode}
        />
      </div>
    </FormKit.Section>
  )
}

export function StudioCreateOrganizationForm() {
  const t = useTranslations("ui")
  const locale = useLocale()
  const format = useFormatter()
  const schema = studioOnboardingOrganizationSchema(t)
  const { data: session } = authClient.useSession()

  const countryOptions = useMemo(
    () => buildStudioOnboardingCountryOptions(format),
    [format]
  )
  const currencyOptions = useMemo(
    () => buildStudioOnboardingCurrencyOptions(format),
    [format]
  )
  const languageOptions = useMemo(
    () => buildStudioOnboardingLanguageOptions(),
    []
  )
  const regionalDefaults = useMemo(
    () => getStudioOnboardingRegionalPlaceholderDefaults(locale),
    [locale]
  )
  const detectedRegionalDefaults = useStudioOnboardingRegionalDefaults(locale)

  const defaultValues = useMemo<StudioOnboardingOrganizationValues>(
    () => ({
      name: "",
      slug: "",
      type: "studio",
      contact: {
        primaryEmail: session?.user.email ?? "",
        businessPhone: "",
      },
      location: {
        countryCode: regionalDefaults.countryCode,
        timezone: regionalDefaults.timezone,
        currencyCode: regionalDefaults.currencyCode,
        defaultLanguage: regionalDefaults.defaultLanguage,
        city: "",
      },
    }),
    [session?.user.email, regionalDefaults]
  )

  async function onSubmit(values: StudioOnboardingOrganizationValues) {
    const setup = buildStudioOnboardingSetupV2(values)
    try {
      await toastManager.promise(
        (async () => {
          const response = await authClient.organization.create({
            name: values.name.trim(),
            slug: values.slug.trim(),
            metadata: { setup },
          })
          if (response.error) {
            throw new Error(
              formatOrgClientError(response.error, {
                fallback: t("couldNotCreateOrganization"),
                limitMessage: t("organizationCreateLimitReached"),
                slugTakenMessage: t("organizationSlugAlreadyTaken"),
              })
            )
          }
          const created = response.data as
            | { id?: string; slug?: string }
            | undefined
          if (created?.id) {
            const activated = await authClient.organization.setActive({
              organizationId: created.id,
            })
            if (activated.error) {
              throw new Error(
                activated.error.message?.trim() ||
                  t("couldNotSwitchOrganization")
              )
            }
          }
          await resumeProvisioning()
          window.location.assign(studioAbsolutePath(locale, "/onboarding/plan"))
        })(),
        {
          loading: t("creatingOrganization"),
          success: t("organizationCreated"),
          error: (error: unknown) =>
            error instanceof Error
              ? error.message
              : t("couldNotCreateOrganization"),
        }
      )
    } catch {
      // toastManager.promise already surfaced the failure.
    }
  }

  return (
    <FormKit
      schema={schema}
      defaultValues={defaultValues}
      onSubmit={onSubmit}
      variant="embedded"
    >
      <StudioOnboardingRegionalPrefill
        activeLocale={locale}
        detectedDefaults={detectedRegionalDefaults}
        placeholderDefaults={regionalDefaults}
        sessionEmail={session?.user.email}
      />
      <FormKit.Section
        title={t("onboardingOrganizationBasicsTitle")}
        description={t("onboardingOrganizationBasicsDescription")}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormKit.Field
            type="text"
            name="name"
            label={t("organizationName")}
            description={t("organizationNameFieldDescription")}
            required
          />
          <StudioOnboardingSlugField />
        </div>
        <StudioOnboardingSlugAutoFill />
        <StudioOnboardingSlugPreview />
      </FormKit.Section>
      <StudioOnboardingOrganizationTypeSection />
      <StudioOnboardingContactSection />
      <StudioOnboardingLocationSection
        countryOptions={countryOptions}
        currencyOptions={currencyOptions}
        languageOptions={languageOptions}
      />
      <StudioOnboardingPageFooter>
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <StudioOnboardingCreateSubmit />
        </div>
      </StudioOnboardingPageFooter>
    </FormKit>
  )
}

function StudioOnboardingRegionalPrefill({
  activeLocale,
  detectedDefaults,
  placeholderDefaults,
  sessionEmail,
}: {
  readonly activeLocale: string
  readonly detectedDefaults: ReturnType<
    typeof studioOnboardingRegionalDefaultsFromDetected
  >
  readonly placeholderDefaults: ReturnType<
    typeof studioOnboardingRegionalDefaultsFromDetected
  >
  readonly sessionEmail: string | undefined
}) {
  const { getValues, setValue } =
    useFormContext<StudioOnboardingOrganizationValues>()
  const syncedLocaleRef = useRef<string | null>(null)

  useEffect(() => {
    const email = sessionEmail?.trim()
    if (!email) return
    if (!getValues("contact.primaryEmail")?.trim()) {
      setValue("contact.primaryEmail", email, {
        shouldDirty: false,
        shouldValidate: true,
      })
    }
  }, [getValues, sessionEmail, setValue])

  useEffect(() => {
    const location = getValues("location")
    const localeChanged =
      syncedLocaleRef.current !== null &&
      syncedLocaleRef.current !== activeLocale

    if (localeChanged) {
      setValue("location.defaultLanguage", detectedDefaults.defaultLanguage, {
        shouldDirty: false,
        shouldValidate: true,
      })
      syncedLocaleRef.current = activeLocale
      return
    }

    if (syncedLocaleRef.current !== null) return

    const matchesPlaceholder =
      location.countryCode === placeholderDefaults.countryCode &&
      location.timezone === placeholderDefaults.timezone &&
      location.currencyCode === placeholderDefaults.currencyCode

    if (!matchesPlaceholder) {
      syncedLocaleRef.current = activeLocale
      return
    }

    if (
      detectedDefaults.countryCode === location.countryCode &&
      detectedDefaults.timezone === location.timezone &&
      detectedDefaults.currencyCode === location.currencyCode &&
      detectedDefaults.defaultLanguage === location.defaultLanguage
    ) {
      syncedLocaleRef.current = activeLocale
      return
    }

    setValue("location.countryCode", detectedDefaults.countryCode, {
      shouldDirty: false,
      shouldValidate: true,
    })
    setValue("location.timezone", detectedDefaults.timezone, {
      shouldDirty: false,
      shouldValidate: true,
    })
    setValue("location.currencyCode", detectedDefaults.currencyCode, {
      shouldDirty: false,
      shouldValidate: true,
    })
    setValue("location.defaultLanguage", detectedDefaults.defaultLanguage, {
      shouldDirty: false,
      shouldValidate: true,
    })
    syncedLocaleRef.current = activeLocale
  }, [activeLocale, detectedDefaults, getValues, placeholderDefaults, setValue])

  useEffect(() => {
    const location = getValues("location")
    const regionalTimezone = studioOnboardingTimezoneForCountry(
      location.countryCode
    )
    if (
      regionalTimezone === "UTC" ||
      (location.timezone !== "UTC" && location.timezone !== "Etc/UTC")
    ) {
      return
    }
    if (location.timezone !== regionalTimezone) {
      setValue("location.timezone", regionalTimezone, {
        shouldDirty: false,
        shouldValidate: true,
      })
    }
  }, [getValues, setValue])

  return null
}

function StudioOnboardingLocationCountryCurrencySync() {
  const { control, setValue } =
    useFormContext<StudioOnboardingOrganizationValues>()
  const countryCode = useWatch({ control, name: "location.countryCode" })
  const skipNextCountrySync = useRef(true)

  useEffect(() => {
    if (!countryCode) return
    if (skipNextCountrySync.current) {
      skipNextCountrySync.current = false
      return
    }
    setValue(
      "location.currencyCode",
      studioOnboardingCurrencyForCountry(countryCode),
      { shouldValidate: true }
    )
  }, [countryCode, setValue])

  return null
}

function StudioOnboardingLocationSection({
  countryOptions,
  currencyOptions,
  languageOptions,
}: {
  readonly countryOptions: ComboboxOption[]
  readonly currencyOptions: ComboboxOption[]
  readonly languageOptions: ComboboxOption[]
}) {
  const t = useTranslations("ui")
  return (
    <FormKit.Section
      title={t("onboardingOrganizationLocationTitle")}
      description={t("onboardingOrganizationLocationDescription")}
    >
      <StudioOnboardingLocationCountryCurrencySync />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <FormKit.Field
          type="combobox"
          name="location.countryCode"
          label={t("organizationCountryCode")}
          description={t("organizationCountryCodeFieldDescription")}
          options={countryOptions}
          placeholder={t("searchRegion")}
          required
        />
        <FormKit.Field
          type="text"
          name="location.city"
          label={t("organizationCityOptional")}
          description={t("organizationOptionalWizardFieldDescription")}
        />
        <FormKit.Field
          type="select-timezone"
          name="location.timezone"
          label={t("organizationTimezone")}
          description={t("organizationTimezoneFieldDescription")}
          required
        />
        <FormKit.Field
          type="combobox"
          name="location.currencyCode"
          label={t("organizationCurrencyCode")}
          description={t("organizationCurrencyCodeFieldDescription")}
          options={currencyOptions}
          placeholder={t("searchCurrency")}
          required
        />
        <FormKit.Field
          type="combobox"
          name="location.defaultLanguage"
          label={t("language")}
          description={t("organizationOptionalWizardFieldDescription")}
          options={languageOptions}
          placeholder={t("selectLanguage")}
        />
      </div>
    </FormKit.Section>
  )
}
