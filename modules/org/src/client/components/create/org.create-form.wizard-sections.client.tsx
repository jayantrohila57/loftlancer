"use client"

import type { ComboboxOption } from "@features/form"
import { FormKit } from "@features/form"
import { clientEnv } from "@packages/t3-env/client"
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@packages/ui/components/alert"
import { useTranslations } from "next-intl"
import { useMemo } from "react"
import { useFormContext, useWatch } from "react-hook-form"
import type { z } from "zod"
import { OrgCreateFormReview } from "./org.create-form.review.client"
import type { createOrganizationFormSchema } from "./org.create-form.schema.client"
import {
  OrgCreateSlugAutoFill,
  OrgCreateSlugPreview,
} from "./org.create-form.slug-fields.client"
import { uploadOrgWizardImageStub } from "./org.create-form.upload.client"

type OrganizationFormValues = z.infer<
  ReturnType<typeof createOrganizationFormSchema>
>

type OrganizationTypeOption = {
  readonly value: "freelancer" | "studio" | "agency" | "company"
  readonly label: string
  readonly description: string
}

export function OrgCreateWizardStepBasics({
  organizationTypeOptions,
}: {
  organizationTypeOptions: readonly OrganizationTypeOption[]
}) {
  const t = useTranslations("ui")
  return (
    <div className="flex w-full flex-col gap-4">
      <FormKit.Field
        type="text"
        name="name"
        label={t("organizationName")}
        description={t("organizationNameFieldDescription")}
        required
      />
      <OrgCreateSlugAutoFill<OrganizationFormValues> />
      <FormKit.Field
        type="text"
        name="slug"
        label={t("organizationSlug")}
        description={t("organizationSlugFieldDescription")}
        required
      />
      <OrgCreateSlugPreview<OrganizationFormValues> />
      <FormKit.Field
        type="radio-group"
        name="basics.type"
        label={t("organizationType")}
        description={t("organizationTypeFieldDescription")}
        options={[...organizationTypeOptions]}
        card
        required
      />
      <FormKit.Field
        type="text"
        name="basics.tagline"
        label={t("organizationTaglineOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="textarea"
        name="basics.description"
        label={t("organizationDescriptionOptional")}
        description={t("organizationDescriptionFieldDescription")}
        maxLength={500}
      />
      <FormKit.Field
        type="avatar-upload"
        name="basics.logoUrl"
        layout="inline"
        label={t("organizationLogoOptional")}
        description={t("organizationLogoUploadBlockerNotice")}
        upload={uploadOrgWizardImageStub}
      />
      <FormKit.Field
        type="url"
        name="logo"
        label={t("organizationLogoUrlFallback")}
        description={t("organizationLogoFieldDescription")}
      />
    </div>
  )
}

export function OrgCreateWizardStepBusiness() {
  const t = useTranslations("ui")
  return (
    <div className="flex w-full flex-col gap-4">
      <FormKit.Field
        type="text"
        name="business.industry"
        label={t("organizationIndustryOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="text"
        name="business.category"
        label={t("organizationCategoryOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="url"
        name="business.website"
        label={t("organizationWebsiteOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="url"
        name="business.portfolioUrl"
        label={t("organizationPortfolioOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
    </div>
  )
}

export function OrgCreateWizardStepContact() {
  const t = useTranslations("ui")
  return (
    <div className="flex w-full flex-col gap-4">
      <FormKit.Field
        type="email"
        name="contact.primaryEmail"
        label={t("organizationPrimaryEmail")}
        description={t("organizationPrimaryEmailDescription")}
        required
      />
      <FormKit.Field
        type="email"
        name="contact.alternativeEmail"
        label={t("organizationAlternativeEmailOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="email"
        name="contact.supportEmail"
        label={t("organizationSupportEmailOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="tel"
        name="contact.businessPhone"
        label={t("organizationBusinessPhoneOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
    </div>
  )
}

export function OrgCreateWizardStepLocation({
  countryOptions,
  currencyOptions,
  mapWorkerUrl,
}: {
  countryOptions: ComboboxOption[]
  currencyOptions: ComboboxOption[]
  mapWorkerUrl: string
}) {
  const t = useTranslations("ui")
  return (
    <div className="flex w-full flex-col gap-4">
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
        type="text"
        name="location.addressLine1"
        label={t("organizationAddressLine1Optional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="text"
        name="location.addressLine2"
        label={t("organizationAddressLine2Optional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="text"
        name="location.postalCode"
        label={t("organizationPostalCodeOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="address-map"
        name="location.geo"
        label={t("organizationMapPinOptional")}
        workerUrl={mapWorkerUrl}
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
    </div>
  )
}

export function OrgCreateWizardStepLegal() {
  const t = useTranslations("ui")
  const { control, setValue } = useFormContext<OrganizationFormValues>()
  const orgType = useWatch({ control, name: "basics.type" })
  const legalSkipped = useWatch({ control, name: "legalSkipped" })

  const isFreelancer = orgType === "freelancer"

  return (
    <div className="flex w-full flex-col gap-4">
      {isFreelancer ? (
        <Alert>
          <AlertTitle>{t("organizationLegalFreelancerBannerTitle")}</AlertTitle>
          <AlertDescription>
            {t("organizationLegalFreelancerBannerDescription")}
          </AlertDescription>
          <FormKit.Field
            type="checkbox"
            name="legalSkipped"
            label={t("organizationLegalSkipNotApplicable")}
            card
          />
        </Alert>
      ) : null}
      {!legalSkipped ? (
        <>
          <FormKit.Field
            type="text"
            name="legal.legalBusinessName"
            label={t("organizationLegalBusinessNameOptional")}
            description={t("organizationOptionalWizardFieldDescription")}
          />
          <FormKit.Field
            type="text"
            name="legal.registrationNumber"
            label={t("organizationRegistrationNumberOptional")}
            description={t("organizationOptionalWizardFieldDescription")}
          />
          <FormKit.Field
            type="text"
            name="legal.taxIdNumber"
            label={t("organizationTaxIdOptional")}
            description={t("organizationOptionalWizardFieldDescription")}
          />
          <FormKit.Field
            type="url"
            name="legal.taxDocumentUrl"
            label={t("organizationTaxDocumentOptional")}
            description={t("organizationTaxDocumentUploadBlockerNotice")}
          />
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          {t("organizationLegalStepSkippedCopy")}
        </p>
      )}
      {!isFreelancer && !legalSkipped ? (
        <FormKit.Field
          type="checkbox"
          name="legalSkipped"
          label={t("organizationLegalSkipNotApplicable")}
          card
          hidden
        />
      ) : null}
      {legalSkipped ? (
        <button
          type="button"
          className="text-sm text-primary underline"
          onClick={() => setValue("legalSkipped", false)}
        >
          {t("organizationLegalResumeStep")}
        </button>
      ) : null}
    </div>
  )
}

export function OrgCreateWizardStepBranding() {
  const t = useTranslations("ui")
  return (
    <div className="flex w-full flex-col gap-4">
      <FormKit.Field
        type="text"
        name="branding.displayName"
        label={t("organizationDisplayNameOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="text"
        name="branding.brandColor"
        label={t("organizationBrandColorOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <FormKit.Field
        type="avatar-upload"
        name="branding.primaryLogoUrl"
        layout="inline"
        label={t("organizationPrimaryLogoOptional")}
        upload={uploadOrgWizardImageStub}
        description={t("organizationLogoUploadBlockerNotice")}
      />
    </div>
  )
}

export function OrgCreateWizardStepWorkspace() {
  const t = useTranslations("ui")
  return (
    <div className="flex w-full flex-col gap-4">
      <FormKit.Field
        type="select"
        name="workspace.defaultMemberRole"
        label={t("organizationDefaultMemberRoleOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
        options={[
          { value: "member", label: t("organizationRoleMember") },
          { value: "manager", label: t("organizationRoleManager") },
        ]}
      />
      <FormKit.Field
        type="text"
        name="workspace.projectNumberPrefix"
        label={t("organizationProjectPrefixOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
    </div>
  )
}

export function OrgCreateWizardStepTeam() {
  const t = useTranslations("ui")
  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t("organizationTeamStepDescription")}
      </p>
      <FormKit.Field
        type="textarea"
        name="team.inviteEmails"
        label={t("organizationInviteEmailsOptional")}
        description={t("organizationInviteEmailsHint")}
      />
      <FormKit.Field
        type="text"
        name="team.firstTeamName"
        label={t("organizationFirstTeamNameOptional")}
        description={t("organizationOptionalWizardFieldDescription")}
      />
      <p className="text-xs text-muted-foreground">
        {t("organizationTeamInvitesBlockerNotice")}
      </p>
    </div>
  )
}

export function OrgCreateWizardSections({
  step,
  organizationTypeOptions,
  countryOptions,
  currencyOptions,
}: {
  step: number
  organizationTypeOptions: readonly OrganizationTypeOption[]
  countryOptions: ComboboxOption[]
  currencyOptions: ComboboxOption[]
}) {
  const mapWorkerUrl = useMemo(() => {
    const base = new URL(clientEnv.NEXT_PUBLIC_AUTH_APP_URL).pathname.replace(
      /\/$/,
      ""
    )
    return `${base}/maplibre-gl-worker.mjs`
  }, [])

  switch (step) {
    case 1:
      return (
        <OrgCreateWizardStepBasics
          organizationTypeOptions={organizationTypeOptions}
        />
      )
    case 2:
      return <OrgCreateWizardStepBusiness />
    case 3:
      return <OrgCreateWizardStepContact />
    case 4:
      return (
        <OrgCreateWizardStepLocation
          countryOptions={countryOptions}
          currencyOptions={currencyOptions}
          mapWorkerUrl={mapWorkerUrl}
        />
      )
    case 5:
      return <OrgCreateWizardStepLegal />
    case 6:
      return <OrgCreateWizardStepBranding />
    case 7:
      return <OrgCreateWizardStepWorkspace />
    case 8:
      return <OrgCreateWizardStepTeam />
    case 9:
      return <OrgCreateFormReview />
    default:
      return null
  }
}
