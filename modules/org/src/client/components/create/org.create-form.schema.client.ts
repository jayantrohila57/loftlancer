import type { useTranslations } from "next-intl"
import { z } from "zod"

import { isValidIanaTimeZone } from "../../../utils/validation/org.timezone"

type UiT = ReturnType<typeof useTranslations<"ui">>

const geoPointSchema = z
  .object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  })
  .optional()
  .nullable()

function timezoneSchema(t: UiT) {
  return z
    .string()
    .trim()
    .min(1, t("organizationTimezoneRequired"))
    .max(64)
    .refine(isValidIanaTimeZone, t("organizationTimezoneInvalid"))
}

/** Client FormKit schema with translated validation messages. */
export function createOrganizationFormSchema(t: UiT) {
  return z
    .object({
      name: z
        .string()
        .trim()
        .min(2, t("organizationNameTooShort"))
        .max(100, t("organizationNameTooLong", { max: 100 })),
      slug: z
        .string()
        .trim()
        .min(1, t("organizationSlugRequired"))
        .max(100, t("organizationSlugTooLong", { max: 100 }))
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, t("organizationSlugInvalid")),
      logo: z
        .union([z.url(t("organizationLogoInvalidUrl")), z.literal("")])
        .optional(),
      version: z.literal(2),
      basics: z.object({
        type: z.enum(["freelancer", "studio", "agency", "company"]),
        tagline: z.string().trim().max(120).optional(),
        description: z
          .string()
          .trim()
          .max(500, t("organizationDescriptionTooLong", { max: 500 }))
          .optional(),
        logoUrl: z
          .union([z.url(t("organizationLogoInvalidUrl")), z.literal("")])
          .optional(),
      }),
      business: z.object({
        industry: z.string().optional(),
        category: z.string().optional(),
        services: z.array(z.string()).optional(),
        website: z.union([z.url(), z.literal("")]).optional(),
        portfolioUrl: z.union([z.url(), z.literal("")]).optional(),
      }),
      contact: z.object({
        primaryEmail: z
          .string()
          .trim()
          .min(1, t("organizationPrimaryEmailRequired"))
          .email(t("organizationPrimaryEmailInvalid")),
        alternativeEmail: z
          .union([
            z.string().trim().email(t("organizationPrimaryEmailInvalid")),
            z.literal(""),
          ])
          .optional(),
        supportEmail: z
          .union([
            z.string().trim().email(t("organizationPrimaryEmailInvalid")),
            z.literal(""),
          ])
          .optional(),
        extraEmails: z.array(z.string().email()).optional(),
        businessPhone: z.string().optional(),
      }),
      location: z.object({
        countryCode: z
          .string()
          .trim()
          .transform((value) => value.toUpperCase())
          .pipe(
            z
              .string()
              .min(1, t("organizationCountryCodeRequired"))
              .regex(/^[A-Z]{2}$/, t("organizationCountryCodeInvalid"))
          ),
        stateProvince: z.string().optional(),
        city: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        postalCode: z.string().optional(),
        timezone: timezoneSchema(t),
        currencyCode: z
          .string()
          .trim()
          .transform((value) => value.toUpperCase())
          .pipe(
            z
              .string()
              .min(1, t("organizationCurrencyCodeRequired"))
              .regex(/^[A-Z]{3}$/, t("organizationCurrencyCodeInvalid"))
          ),
        defaultLanguage: z.string().optional(),
        geo: geoPointSchema,
      }),
      legalSkipped: z.boolean().optional(),
      legal: z.object({
        skipped: z.boolean().optional(),
        legalBusinessName: z.string().optional(),
        legalEntityType: z.string().optional(),
        registrationNumber: z.string().optional(),
        taxIdType: z.string().optional(),
        taxIdNumber: z.string().optional(),
        taxDocumentUrl: z.union([z.url(), z.literal("")]).optional(),
      }),
      branding: z.object({
        displayName: z.string().optional(),
        brandColor: z.string().optional(),
        primaryLogoUrl: z
          .union([z.url(t("organizationLogoInvalidUrl")), z.literal("")])
          .optional(),
      }),
      workspace: z.object({
        defaultMemberRole: z.enum(["member", "manager"]).optional(),
        projectNumberPrefix: z.string().optional(),
      }),
      team: z.object({
        inviteEmails: z.string().optional(),
        firstTeamName: z.string().optional(),
      }),
    })
    .superRefine((values) => {
      const isFreelancer = values.basics.type === "freelancer"
      const legalSkipped = values.legalSkipped || values.legal.skipped
      if (isFreelancer && legalSkipped) return
      if (!isFreelancer && legalSkipped) return
    })
}
