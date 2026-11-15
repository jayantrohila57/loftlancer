"use client"

import { useTranslations } from "next-intl"
import { useFormContext, useWatch } from "react-hook-form"
import type { z } from "zod"

import type { createOrganizationFormSchema } from "./org.create-form.schema.client"

type OrganizationFormValues = z.infer<
  ReturnType<typeof createOrganizationFormSchema>
>

const SECTION_KEYS = [
  ["basics", "organizationCreateSectionBasics"],
  ["business", "organizationCreateSectionBusiness"],
  ["contact", "organizationCreateSectionContact"],
  ["location", "organizationCreateSectionLocation"],
  ["legal", "organizationCreateSectionLegal"],
  ["branding", "organizationCreateSectionBranding"],
  ["workspace", "organizationCreateSectionWorkspace"],
  ["team", "organizationCreateSectionTeam"],
] as const

const TYPE_LABEL_KEYS = {
  freelancer: "organizationTypeFreelancer",
  studio: "organizationTypeStudio",
  agency: "organizationTypeAgency",
  company: "organizationTypeCompany",
} as const

export function OrgCreateFormReview() {
  const t = useTranslations("ui")
  const { control } = useFormContext<OrganizationFormValues>()
  const values = useWatch({ control }) as OrganizationFormValues

  function sectionStatus(section: (typeof SECTION_KEYS)[number][0]) {
    switch (section) {
      case "basics":
        return values.name && values.slug && values.basics.type
          ? t("organizationReviewStatusProvided")
          : t("organizationReviewStatusRequired")
      case "contact":
        return values.contact.primaryEmail
          ? t("organizationReviewStatusProvided")
          : t("organizationReviewStatusRequired")
      case "location":
        return values.location.countryCode &&
          values.location.timezone &&
          values.location.currencyCode
          ? t("organizationReviewStatusProvided")
          : t("organizationReviewStatusRequired")
      case "legal":
        return values.legalSkipped || values.legal.skipped
          ? t("organizationReviewStatusSkipped")
          : values.legal.legalBusinessName ||
              values.legal.taxIdNumber ||
              values.legal.taxDocumentUrl
            ? t("organizationReviewStatusProvided")
            : t("organizationReviewStatusOptional")
      default:
        return t("organizationReviewStatusOptional")
    }
  }

  const logo = values.logo || values.basics.logoUrl
  const typeLabel = TYPE_LABEL_KEYS[values.basics.type]

  return (
    <div className="flex w-full flex-col gap-4">
      <p className="text-sm text-muted-foreground">
        {t("organizationCreateReviewDescription")}
      </p>
      <div className="rounded-lg border p-4">
        <div className="flex flex-wrap items-center gap-3">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logo}
              alt=""
              className="size-12 rounded-md border object-cover"
            />
          ) : null}
          <div>
            <p className="font-medium">{values.name || "—"}</p>
            <p className="text-sm text-muted-foreground">{t(typeLabel)}</p>
          </div>
        </div>
      </div>
      <ul className="divide-y divide-border rounded-lg border">
        {SECTION_KEYS.map(([section, labelKey]) => (
          <li
            key={section}
            className="flex items-center justify-between gap-4 px-4 py-3 text-sm"
          >
            <span>{t(labelKey)}</span>
            <span className="text-muted-foreground">
              {sectionStatus(section)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
