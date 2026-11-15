import type { Db } from "@packages/drizzle"
import {
  organizationAddress,
  organizationBranding,
  organizationContact,
  organizationLegal,
  organizationProfile,
  organizationSettings,
  organizationTax,
  organizationWorkspace,
} from "@packages/drizzle/schema"
import type { OrganizationSetupV2 } from "../../utils/validation/org.setup.schema"

type Transaction = Parameters<Parameters<Db["transaction"]>[0]>[0]
export type OrgSetupDbExecutor = Db | Transaction

function emptyToNull(value: string | undefined) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

export async function provisionOrganizationSetupV2(input: {
  organizationId: string
  setup: OrganizationSetupV2
  tx: OrgSetupDbExecutor
}) {
  const { setup, organizationId, tx } = input
  const { basics, business, contact, location, legal, branding, workspace } =
    setup

  await tx
    .insert(organizationProfile)
    .values({
      organizationId,
      type: basics.type,
      description: emptyToNull(basics.description) ?? null,
      countryCode: location.countryCode,
      tagline: emptyToNull(basics.tagline),
      industry: emptyToNull(business?.industry),
      category: emptyToNull(business?.category),
      services: business?.services?.length ? business.services : null,
      specializations: business?.specializations?.length
        ? business.specializations
        : null,
      businessSize: emptyToNull(business?.businessSize),
      yearEstablished: business?.yearEstablished ?? null,
      website: emptyToNull(business?.website),
      portfolioUrl: emptyToNull(business?.portfolioUrl),
      socialProfiles: business?.socialProfiles?.length
        ? business.socialProfiles
        : null,
    })
    .onConflictDoUpdate({
      target: organizationProfile.organizationId,
      set: {
        type: basics.type,
        description: emptyToNull(basics.description) ?? null,
        countryCode: location.countryCode,
        tagline: emptyToNull(basics.tagline),
        industry: emptyToNull(business?.industry),
        category: emptyToNull(business?.category),
        services: business?.services?.length ? business.services : null,
        specializations: business?.specializations?.length
          ? business.specializations
          : null,
        businessSize: emptyToNull(business?.businessSize),
        yearEstablished: business?.yearEstablished ?? null,
        website: emptyToNull(business?.website),
        portfolioUrl: emptyToNull(business?.portfolioUrl),
        socialProfiles: business?.socialProfiles?.length
          ? business.socialProfiles
          : null,
      },
    })

  await tx
    .insert(organizationSettings)
    .values({
      organizationId,
      timezone: location.timezone,
      currencyCode: location.currencyCode,
      defaultLanguage: emptyToNull(location.defaultLanguage),
    })
    .onConflictDoUpdate({
      target: organizationSettings.organizationId,
      set: {
        timezone: location.timezone,
        currencyCode: location.currencyCode,
        defaultLanguage: emptyToNull(location.defaultLanguage),
      },
    })

  await tx
    .insert(organizationContact)
    .values({
      organizationId,
      primaryEmail: contact.primaryEmail,
      alternativeEmail: emptyToNull(contact.alternativeEmail),
      supportEmail: emptyToNull(contact.supportEmail),
      businessPhone: emptyToNull(contact.businessPhone),
      contactPerson: emptyToNull(contact.contactPerson),
      preferredLanguage: emptyToNull(contact.preferredLanguage),
      businessHours: contact.businessHours ?? null,
      extraEmails: contact.extraEmails?.length ? contact.extraEmails : null,
    })
    .onConflictDoUpdate({
      target: organizationContact.organizationId,
      set: {
        primaryEmail: contact.primaryEmail,
        alternativeEmail: emptyToNull(contact.alternativeEmail),
        supportEmail: emptyToNull(contact.supportEmail),
        businessPhone: emptyToNull(contact.businessPhone),
        contactPerson: emptyToNull(contact.contactPerson),
        preferredLanguage: emptyToNull(contact.preferredLanguage),
        businessHours: contact.businessHours ?? null,
        extraEmails: contact.extraEmails?.length ? contact.extraEmails : null,
      },
    })

  await tx
    .insert(organizationAddress)
    .values({
      organizationId,
      countryCode: location.countryCode,
      stateProvince: emptyToNull(location.stateProvince),
      city: emptyToNull(location.city),
      addressLine1: emptyToNull(location.addressLine1),
      addressLine2: emptyToNull(location.addressLine2),
      postalCode: emptyToNull(location.postalCode),
      latitude: location.geo?.lat ?? null,
      longitude: location.geo?.lng ?? null,
      defaultLanguage: emptyToNull(location.defaultLanguage),
      billingSameAsPrimary: location.billingSameAsPrimary ?? null,
    })
    .onConflictDoUpdate({
      target: organizationAddress.organizationId,
      set: {
        countryCode: location.countryCode,
        stateProvince: emptyToNull(location.stateProvince),
        city: emptyToNull(location.city),
        addressLine1: emptyToNull(location.addressLine1),
        addressLine2: emptyToNull(location.addressLine2),
        postalCode: emptyToNull(location.postalCode),
        latitude: location.geo?.lat ?? null,
        longitude: location.geo?.lng ?? null,
        defaultLanguage: emptyToNull(location.defaultLanguage),
        billingSameAsPrimary: location.billingSameAsPrimary ?? null,
      },
    })

  if (legal) {
    await tx
      .insert(organizationLegal)
      .values({
        organizationId,
        skipped: legal.skipped ?? false,
        legalBusinessName: emptyToNull(legal.legalBusinessName),
        legalEntityType: emptyToNull(legal.legalEntityType),
        registrationNumber: emptyToNull(legal.registrationNumber),
        taxRegistrationStatus: emptyToNull(legal.taxRegistrationStatus),
        registeredAddress: legal.registeredAddress ?? null,
        invoiceLegalName: emptyToNull(legal.invoiceLegalName),
      })
      .onConflictDoUpdate({
        target: organizationLegal.organizationId,
        set: {
          skipped: legal.skipped ?? false,
          legalBusinessName: emptyToNull(legal.legalBusinessName),
          legalEntityType: emptyToNull(legal.legalEntityType),
          registrationNumber: emptyToNull(legal.registrationNumber),
          taxRegistrationStatus: emptyToNull(legal.taxRegistrationStatus),
          registeredAddress: legal.registeredAddress ?? null,
          invoiceLegalName: emptyToNull(legal.invoiceLegalName),
        },
      })

    await tx
      .insert(organizationTax)
      .values({
        organizationId,
        taxIdType: emptyToNull(legal.taxIdType),
        taxIdNumber: emptyToNull(legal.taxIdNumber),
        taxDocumentAssetId: legal.taxDocumentAssetId ?? null,
        taxDocumentUrl: emptyToNull(legal.taxDocumentUrl),
      })
      .onConflictDoUpdate({
        target: organizationTax.organizationId,
        set: {
          taxIdType: emptyToNull(legal.taxIdType),
          taxIdNumber: emptyToNull(legal.taxIdNumber),
          taxDocumentAssetId: legal.taxDocumentAssetId ?? null,
          taxDocumentUrl: emptyToNull(legal.taxDocumentUrl),
        },
      })
  }

  if (branding) {
    await tx
      .insert(organizationBranding)
      .values({
        organizationId,
        displayName: emptyToNull(branding.displayName),
        primaryLogoAssetId: branding.primaryLogoAssetId ?? null,
        secondaryLogoAssetId: branding.secondaryLogoAssetId ?? null,
        coverImageAssetId: branding.coverImageAssetId ?? null,
        brandColor: emptyToNull(branding.brandColor),
        customDomain: emptyToNull(branding.customDomain),
        emailSignatureHtml: emptyToNull(branding.emailSignatureHtml),
        documentFooter: emptyToNull(branding.documentFooter),
      })
      .onConflictDoUpdate({
        target: organizationBranding.organizationId,
        set: {
          displayName: emptyToNull(branding.displayName),
          primaryLogoAssetId: branding.primaryLogoAssetId ?? null,
          secondaryLogoAssetId: branding.secondaryLogoAssetId ?? null,
          coverImageAssetId: branding.coverImageAssetId ?? null,
          brandColor: emptyToNull(branding.brandColor),
          customDomain: emptyToNull(branding.customDomain),
          emailSignatureHtml: emptyToNull(branding.emailSignatureHtml),
          documentFooter: emptyToNull(branding.documentFooter),
        },
      })
  }

  if (workspace) {
    await tx
      .insert(organizationWorkspace)
      .values({
        organizationId,
        workspaceVisibility: workspace.workspaceVisibility ?? null,
        defaultProjectVisibility: workspace.defaultProjectVisibility ?? null,
        defaultMemberRole: workspace.defaultMemberRole ?? null,
        projectNumberPrefix: emptyToNull(workspace.projectNumberPrefix),
        invoiceNumberPrefix: emptyToNull(workspace.invoiceNumberPrefix),
        defaultPaymentTerms: emptyToNull(workspace.defaultPaymentTerms),
        defaultHourlyRate:
          workspace.defaultHourlyRate != null
            ? Math.round(workspace.defaultHourlyRate)
            : null,
        workweek: workspace.workweek?.length ? workspace.workweek : null,
        dateTimeFormat: emptyToNull(workspace.dateTimeFormat),
        numberFormat: emptyToNull(workspace.numberFormat),
        fiscalYearStartMonth: workspace.fiscalYearStartMonth ?? null,
      })
      .onConflictDoUpdate({
        target: organizationWorkspace.organizationId,
        set: {
          workspaceVisibility: workspace.workspaceVisibility ?? null,
          defaultProjectVisibility: workspace.defaultProjectVisibility ?? null,
          defaultMemberRole: workspace.defaultMemberRole ?? null,
          projectNumberPrefix: emptyToNull(workspace.projectNumberPrefix),
          invoiceNumberPrefix: emptyToNull(workspace.invoiceNumberPrefix),
          defaultPaymentTerms: emptyToNull(workspace.defaultPaymentTerms),
          defaultHourlyRate:
            workspace.defaultHourlyRate != null
              ? Math.round(workspace.defaultHourlyRate)
              : null,
          workweek: workspace.workweek?.length ? workspace.workweek : null,
          dateTimeFormat: emptyToNull(workspace.dateTimeFormat),
          numberFormat: emptyToNull(workspace.numberFormat),
          fiscalYearStartMonth: workspace.fiscalYearStartMonth ?? null,
        },
      })
  }
}
