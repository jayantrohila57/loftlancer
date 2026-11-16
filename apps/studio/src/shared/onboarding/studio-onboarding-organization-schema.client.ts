import { isValidIanaTimeZone } from "@modules/org/utils/validation/org.timezone"
import type { useTranslations } from "next-intl"
import { z } from "zod"
import {
  STUDIO_ORG_SLUG_MAX_LENGTH,
  STUDIO_ORG_SLUG_PATTERN,
} from "@/shared/org/studio-org.constants"
import { isReservedStudioOrgSlug } from "@/shared/org/studio-org.paths"

type UiT = ReturnType<typeof useTranslations<"ui">>

function timezoneSchema(t: UiT) {
  return z
    .string()
    .trim()
    .min(1, t("organizationTimezoneRequired"))
    .max(64)
    .refine(isValidIanaTimeZone, t("organizationTimezoneInvalid"))
}

export function studioOnboardingOrganizationSchema(t: UiT) {
  return z.object({
    name: z
      .string()
      .trim()
      .min(2, t("organizationNameTooShort"))
      .max(100, t("organizationNameTooLong", { max: 100 })),
    slug: z
      .string()
      .trim()
      .toLowerCase()
      .min(1, t("organizationSlugRequired"))
      .max(
        STUDIO_ORG_SLUG_MAX_LENGTH,
        t("organizationSlugTooLong", { max: STUDIO_ORG_SLUG_MAX_LENGTH })
      )
      .regex(STUDIO_ORG_SLUG_PATTERN, t("organizationSlugInvalid"))
      .refine(
        (value) => !isReservedStudioOrgSlug(value),
        t("organizationSlugInvalid")
      ),
    type: z.enum(["freelancer", "studio", "agency", "company"]),
    contact: z.object({
      primaryEmail: z
        .string()
        .trim()
        .min(1, t("organizationPrimaryEmailRequired"))
        .email(t("organizationPrimaryEmailInvalid")),
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
      city: z.string().optional(),
      defaultLanguage: z.string().trim().optional(),
    }),
  })
}
