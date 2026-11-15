import { getDb } from "@packages/drizzle"
import {
  organization,
  organizationAddress,
  organizationBranding,
  organizationContact,
  organizationLegal,
  organizationProfile,
  organizationSettings,
  organizationTax,
  organizationWorkspace,
} from "@packages/drizzle/schema"
import { eq } from "drizzle-orm"
import type { OrganizationSetupV2 } from "../../utils/validation/org.setup.schema"

export async function readOrganizationSetupV2(
  organizationId: string
): Promise<OrganizationSetupV2 | null> {
  const db = getDb()
  if (!db) return null

  const [profile] = await db
    .select()
    .from(organizationProfile)
    .where(eq(organizationProfile.organizationId, organizationId))
    .limit(1)
  const [settings] = await db
    .select()
    .from(organizationSettings)
    .where(eq(organizationSettings.organizationId, organizationId))
    .limit(1)
  const [contact] = await db
    .select()
    .from(organizationContact)
    .where(eq(organizationContact.organizationId, organizationId))
    .limit(1)
  const [address] = await db
    .select()
    .from(organizationAddress)
    .where(eq(organizationAddress.organizationId, organizationId))
    .limit(1)

  if (!profile || !settings || !contact || !address) return null

  const [legal] = await db
    .select()
    .from(organizationLegal)
    .where(eq(organizationLegal.organizationId, organizationId))
    .limit(1)
  const [tax] = await db
    .select()
    .from(organizationTax)
    .where(eq(organizationTax.organizationId, organizationId))
    .limit(1)
  const [branding] = await db
    .select()
    .from(organizationBranding)
    .where(eq(organizationBranding.organizationId, organizationId))
    .limit(1)
  const [workspace] = await db
    .select()
    .from(organizationWorkspace)
    .where(eq(organizationWorkspace.organizationId, organizationId))
    .limit(1)
  const [orgRow] = await db
    .select({ logo: organization.logo })
    .from(organization)
    .where(eq(organization.id, organizationId))
    .limit(1)

  const geo =
    address.latitude != null && address.longitude != null
      ? { lat: address.latitude, lng: address.longitude }
      : undefined

  return {
    version: 2,
    basics: {
      type: profile.type,
      tagline: profile.tagline ?? undefined,
      description: profile.description ?? undefined,
      logoUrl: orgRow?.logo ?? undefined,
    },
    business: {
      industry: profile.industry ?? undefined,
      category: profile.category ?? undefined,
      services: profile.services ?? undefined,
      specializations: profile.specializations ?? undefined,
      businessSize: profile.businessSize ?? undefined,
      yearEstablished: profile.yearEstablished ?? undefined,
      website: profile.website ?? undefined,
      portfolioUrl: profile.portfolioUrl ?? undefined,
      socialProfiles: profile.socialProfiles ?? undefined,
    },
    contact: {
      primaryEmail: contact.primaryEmail,
      alternativeEmail: contact.alternativeEmail ?? undefined,
      supportEmail: contact.supportEmail ?? undefined,
      businessPhone: contact.businessPhone ?? undefined,
      contactPerson: contact.contactPerson ?? undefined,
      preferredLanguage: contact.preferredLanguage ?? undefined,
      businessHours:
        (contact.businessHours as Record<string, unknown> | null) ?? undefined,
      extraEmails: contact.extraEmails ?? undefined,
    },
    location: {
      countryCode: address.countryCode,
      stateProvince: address.stateProvince ?? undefined,
      city: address.city ?? undefined,
      addressLine1: address.addressLine1 ?? undefined,
      addressLine2: address.addressLine2 ?? undefined,
      postalCode: address.postalCode ?? undefined,
      timezone: settings.timezone,
      currencyCode: settings.currencyCode,
      defaultLanguage:
        address.defaultLanguage ?? settings.defaultLanguage ?? undefined,
      billingSameAsPrimary: address.billingSameAsPrimary ?? undefined,
      geo,
    },
    legal: legal
      ? {
          skipped: legal.skipped,
          legalBusinessName: legal.legalBusinessName ?? undefined,
          legalEntityType: legal.legalEntityType ?? undefined,
          registrationNumber: legal.registrationNumber ?? undefined,
          taxRegistrationStatus: legal.taxRegistrationStatus ?? undefined,
          taxIdType: tax?.taxIdType ?? undefined,
          taxIdNumber: tax?.taxIdNumber ?? undefined,
          registeredAddress:
            (legal.registeredAddress as Record<string, unknown> | null) ??
            undefined,
          invoiceLegalName: legal.invoiceLegalName ?? undefined,
          taxDocumentAssetId: tax?.taxDocumentAssetId ?? undefined,
          taxDocumentUrl: tax?.taxDocumentUrl ?? undefined,
        }
      : undefined,
    branding: branding
      ? {
          displayName: branding.displayName ?? undefined,
          primaryLogoAssetId: branding.primaryLogoAssetId ?? undefined,
          secondaryLogoAssetId: branding.secondaryLogoAssetId ?? undefined,
          coverImageAssetId: branding.coverImageAssetId ?? undefined,
          brandColor: branding.brandColor ?? undefined,
          customDomain: branding.customDomain ?? undefined,
          emailSignatureHtml: branding.emailSignatureHtml ?? undefined,
          documentFooter: branding.documentFooter ?? undefined,
        }
      : undefined,
    workspace: workspace
      ? {
          workspaceVisibility:
            (workspace.workspaceVisibility as
              | "private"
              | "restricted"
              | undefined) ?? undefined,
          defaultProjectVisibility:
            (workspace.defaultProjectVisibility as
              | "private"
              | "shared"
              | undefined) ?? undefined,
          defaultMemberRole:
            (workspace.defaultMemberRole as "member" | "manager" | undefined) ??
            undefined,
          projectNumberPrefix: workspace.projectNumberPrefix ?? undefined,
          invoiceNumberPrefix: workspace.invoiceNumberPrefix ?? undefined,
          defaultPaymentTerms: workspace.defaultPaymentTerms ?? undefined,
          defaultHourlyRate: workspace.defaultHourlyRate ?? undefined,
          workweek: workspace.workweek ?? undefined,
          dateTimeFormat: workspace.dateTimeFormat ?? undefined,
          numberFormat: workspace.numberFormat ?? undefined,
          fiscalYearStartMonth: workspace.fiscalYearStartMonth ?? undefined,
        }
      : undefined,
  }
}
