"use client"

import { useState } from "react"
import type { FieldPath } from "react-hook-form"
import { useFormContext, useWatch } from "react-hook-form"
import type { z } from "zod"

import type { createOrganizationFormSchema } from "./org.create-form.schema.client"

export type OrganizationFormValues = z.infer<
  ReturnType<typeof createOrganizationFormSchema>
>

/** Eight content steps plus review (step 9). */
export const ORG_CREATE_WIZARD_STEP_COUNT = 9

export const ORG_CREATE_WIZARD_REVIEW_TASK_IDS = [
  "review:basics",
  "review:business",
  "review:contact",
  "review:location",
  "review:legal",
  "review:branding",
  "review:workspace",
  "review:team",
] as const

export type OrgCreateWizardReviewTask =
  (typeof ORG_CREATE_WIZARD_REVIEW_TASK_IDS)[number]

export type OrgCreateWizardNavTask =
  | FieldPath<OrganizationFormValues>
  | OrgCreateWizardReviewTask

/** Sidebar sub-task labels — same keys as FormKit `label={t("…")}` in wizard sections. */
export const ORG_CREATE_WIZARD_TASK_LABEL_KEYS = {
  name: "organizationName",
  slug: "organizationSlug",
  "basics.type": "organizationType",
  "basics.tagline": "organizationTaglineOptional",
  "basics.description": "organizationDescriptionOptional",
  "basics.logoUrl": "organizationLogoOptional",
  logo: "organizationLogoUrlFallback",
  "business.industry": "organizationIndustryOptional",
  "business.category": "organizationCategoryOptional",
  "business.website": "organizationWebsiteOptional",
  "business.portfolioUrl": "organizationPortfolioOptional",
  "contact.primaryEmail": "organizationPrimaryEmail",
  "contact.businessPhone": "organizationBusinessPhoneOptional",
  "contact.alternativeEmail": "organizationAlternativeEmailOptional",
  "contact.supportEmail": "organizationSupportEmailOptional",
  "location.countryCode": "organizationCountryCode",
  "location.city": "organizationCityOptional",
  "location.addressLine1": "organizationAddressLine1Optional",
  "location.addressLine2": "organizationAddressLine2Optional",
  "location.postalCode": "organizationPostalCodeOptional",
  "location.geo": "organizationMapPinOptional",
  "location.timezone": "organizationTimezone",
  "location.currencyCode": "organizationCurrencyCode",
  "legal.legalBusinessName": "organizationLegalBusinessNameOptional",
  "legal.registrationNumber": "organizationRegistrationNumberOptional",
  "legal.taxIdNumber": "organizationTaxIdOptional",
  "legal.taxDocumentUrl": "organizationTaxDocumentOptional",
  "branding.displayName": "organizationDisplayNameOptional",
  "branding.primaryLogoUrl": "organizationPrimaryLogoOptional",
  "branding.brandColor": "organizationBrandColorOptional",
  "workspace.defaultMemberRole": "organizationDefaultMemberRoleOptional",
  "workspace.projectNumberPrefix": "organizationProjectPrefixOptional",
  "team.inviteEmails": "organizationInviteEmailsOptional",
  "team.firstTeamName": "organizationFirstTeamNameOptional",
  "review:basics": "organizationCreateSectionBasics",
  "review:business": "organizationCreateSectionBusiness",
  "review:contact": "organizationCreateSectionContact",
  "review:location": "organizationCreateSectionLocation",
  "review:legal": "organizationCreateSectionLegal",
  "review:branding": "organizationCreateSectionBranding",
  "review:workspace": "organizationCreateSectionWorkspace",
  "review:team": "organizationCreateSectionTeam",
} as const satisfies Record<string, string>

export type OrgCreateWizardTaskLabelKey =
  (typeof ORG_CREATE_WIZARD_TASK_LABEL_KEYS)[keyof typeof ORG_CREATE_WIZARD_TASK_LABEL_KEYS]

export function orgCreateWizardTaskLabelKey(
  task: OrgCreateWizardNavTask
): OrgCreateWizardTaskLabelKey {
  const key =
    ORG_CREATE_WIZARD_TASK_LABEL_KEYS[
      task as keyof typeof ORG_CREATE_WIZARD_TASK_LABEL_KEYS
    ]
  return key ?? "organizationName"
}

function wizardValidateFields<
  const T extends readonly FieldPath<OrganizationFormValues>[],
>(fields: T) {
  return fields
}

/** Fields validated when leaving each wizard step (`Next`). */
export const ORG_CREATE_STEP_VALIDATE_FIELDS = [
  wizardValidateFields(["name", "slug", "basics.type"]),
  wizardValidateFields([]),
  wizardValidateFields(["contact.primaryEmail"]),
  wizardValidateFields([
    "location.countryCode",
    "location.timezone",
    "location.currencyCode",
  ]),
  wizardValidateFields([]),
  wizardValidateFields([]),
  wizardValidateFields([]),
  wizardValidateFields([]),
  wizardValidateFields([]),
] as const

/** Collapsible sidebar sub-steps per wizard phase. */
export const ORG_CREATE_WIZARD_NAV_TASKS: ReadonlyArray<
  ReadonlyArray<OrgCreateWizardNavTask>
> = [
  [
    "name",
    "slug",
    "basics.type",
    "basics.tagline",
    "basics.description",
    "basics.logoUrl",
    "logo",
  ],
  [
    "business.industry",
    "business.category",
    "business.website",
    "business.portfolioUrl",
  ],
  [
    "contact.primaryEmail",
    "contact.businessPhone",
    "contact.alternativeEmail",
    "contact.supportEmail",
  ],
  [
    "location.countryCode",
    "location.city",
    "location.addressLine1",
    "location.addressLine2",
    "location.postalCode",
    "location.geo",
    "location.timezone",
    "location.currencyCode",
  ],
  [
    "legal.legalBusinessName",
    "legal.registrationNumber",
    "legal.taxIdNumber",
    "legal.taxDocumentUrl",
  ],
  ["branding.displayName", "branding.primaryLogoUrl", "branding.brandColor"],
  ["workspace.defaultMemberRole", "workspace.projectNumberPrefix"],
  ["team.inviteEmails", "team.firstTeamName"],
  [...ORG_CREATE_WIZARD_REVIEW_TASK_IDS],
]

export function useOrgCreateWizardNav() {
  const [wizardStep, setWizardStep] = useState(1)
  const [navOpen, setNavOpen] = useState(true)
  const { trigger, getValues } = useFormContext<OrganizationFormValues>()
  const legalSkipped = useWatch({ name: "legalSkipped" })

  async function goNext() {
    if (wizardStep === 5 && legalSkipped) {
      if (wizardStep < ORG_CREATE_WIZARD_STEP_COUNT) {
        setWizardStep((step) => step + 1)
        setNavOpen(true)
      }
      return
    }
    const fields = ORG_CREATE_STEP_VALIDATE_FIELDS[wizardStep - 1]
    if (fields?.length) {
      const valid = await trigger([...fields])
      if (!valid) return
    }
    if (wizardStep < ORG_CREATE_WIZARD_STEP_COUNT) {
      setWizardStep((step) => step + 1)
      setNavOpen(true)
    }
  }

  function goPrevious() {
    if (wizardStep > 1) {
      setWizardStep((step) => step - 1)
      setNavOpen(true)
    }
  }

  function selectPhase(next: number) {
    if (next === wizardStep) {
      setNavOpen((open) => !open)
      return
    }
    if (next < wizardStep) {
      setWizardStep(next)
      setNavOpen(true)
    }
  }

  return {
    wizardStep,
    navOpen,
    goNext,
    goPrevious,
    selectPhase,
    isFirstStep: wizardStep === 1,
    isLastStep: wizardStep === ORG_CREATE_WIZARD_STEP_COUNT,
    orgType: getValues("basics.type"),
  }
}

export type OrgCreateWizardNav = ReturnType<typeof useOrgCreateWizardNav>
