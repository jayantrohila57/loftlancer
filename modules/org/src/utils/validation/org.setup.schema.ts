import { z } from "zod"

export const geoPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
})

export const organizationSetupBasicsSchema = z.object({
  type: z.enum(["freelancer", "studio", "agency", "company"]),
  tagline: z.string().trim().max(120).optional(),
  description: z.string().trim().max(500).optional(),
  logoAssetId: z.string().uuid().optional(),
  logoUrl: z.union([z.url(), z.literal("")]).optional(),
})

export const organizationSetupBusinessSchema = z.object({
  industry: z.string().optional(),
  category: z.string().optional(),
  services: z.array(z.string()).max(32).optional(),
  specializations: z.array(z.string()).max(32).optional(),
  businessSize: z.string().optional(),
  yearEstablished: z.number().int().min(1900).max(2100).optional(),
  website: z.union([z.url(), z.literal("")]).optional(),
  portfolioUrl: z.union([z.url(), z.literal("")]).optional(),
  socialProfiles: z
    .array(z.object({ label: z.string().optional(), url: z.url() }))
    .max(12)
    .optional(),
})

export const organizationSetupContactSchema = z.object({
  primaryEmail: z.string().email(),
  businessPhone: z.string().optional(),
  alternativeEmail: z.union([z.string().email(), z.literal("")]).optional(),
  supportEmail: z.union([z.string().email(), z.literal("")]).optional(),
  extraEmails: z.array(z.string().email()).max(8).optional(),
  contactPerson: z.string().optional(),
  preferredLanguage: z.string().optional(),
  businessHours: z.record(z.string(), z.unknown()).optional(),
})

const timezoneSchema = z
  .string()
  .min(1)
  .max(64)
  .refine((zone) => {
    try {
      new Intl.DateTimeFormat("en", { timeZone: zone })
      return true
    } catch {
      return false
    }
  })

export const organizationSetupLocationSchema = z.object({
  countryCode: z.string().regex(/^[A-Z]{2}$/),
  stateProvince: z.string().optional(),
  city: z.string().optional(),
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  postalCode: z.string().optional(),
  timezone: timezoneSchema,
  currencyCode: z.string().regex(/^[A-Z]{3}$/),
  defaultLanguage: z.string().optional(),
  billingSameAsPrimary: z.boolean().optional(),
  geo: geoPointSchema.optional(),
})

export const organizationSetupLegalSchema = z.object({
  skipped: z.boolean().optional(),
  legalBusinessName: z.string().optional(),
  legalEntityType: z.string().optional(),
  registrationNumber: z.string().optional(),
  taxRegistrationStatus: z.string().optional(),
  taxIdType: z.string().optional(),
  taxIdNumber: z.string().optional(),
  registeredAddress: z.record(z.string(), z.unknown()).optional(),
  invoiceLegalName: z.string().optional(),
  taxDocumentAssetId: z.string().uuid().optional(),
  taxDocumentUrl: z.union([z.url(), z.literal("")]).optional(),
})

export const organizationSetupBrandingSchema = z.object({
  displayName: z.string().optional(),
  primaryLogoAssetId: z.string().uuid().optional(),
  secondaryLogoAssetId: z.string().uuid().optional(),
  coverImageAssetId: z.string().uuid().optional(),
  brandColor: z.string().optional(),
  customDomain: z.string().optional(),
  emailSignatureHtml: z.string().optional(),
  documentFooter: z.string().optional(),
})

export const organizationSetupWorkspaceSchema = z.object({
  workspaceVisibility: z.enum(["private", "restricted"]).optional(),
  defaultProjectVisibility: z.enum(["private", "shared"]).optional(),
  defaultMemberRole: z.enum(["member", "manager"]).optional(),
  projectNumberPrefix: z.string().optional(),
  invoiceNumberPrefix: z.string().optional(),
  defaultPaymentTerms: z.string().optional(),
  defaultHourlyRate: z.number().nullable().optional(),
  workweek: z.array(z.string()).optional(),
  dateTimeFormat: z.string().optional(),
  numberFormat: z.string().optional(),
  fiscalYearStartMonth: z.number().int().min(1).max(12).optional(),
})

export const organizationSetupTeamSchema = z.object({
  invites: z
    .array(
      z.object({
        email: z.string().email(),
        role: z.enum(["member", "manager"]).optional(),
      })
    )
    .max(20)
    .optional(),
  firstTeamName: z.string().optional(),
  firstTeamDescription: z.string().optional(),
  inviteMessage: z.string().optional(),
})

export const organizationSetupSchemaV2 = z.object({
  version: z.literal(2),
  basics: organizationSetupBasicsSchema,
  business: organizationSetupBusinessSchema.optional(),
  contact: organizationSetupContactSchema,
  location: organizationSetupLocationSchema,
  legal: organizationSetupLegalSchema.optional(),
  branding: organizationSetupBrandingSchema.optional(),
  workspace: organizationSetupWorkspaceSchema.optional(),
  team: organizationSetupTeamSchema.optional(),
})

export type OrganizationSetupV2 = z.infer<typeof organizationSetupSchemaV2>

export const organizationSetupPatchSchema = organizationSetupSchemaV2
  .omit({ version: true })
  .partial()
