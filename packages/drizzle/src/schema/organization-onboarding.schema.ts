import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core"

import { organization } from "./organization.schema"

/** Contact channels for an organization (not the owner account email). */
export const organizationContact = pgTable("organization_contact", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  primaryEmail: text("primary_email").notNull(),
  alternativeEmail: text("alternative_email"),
  supportEmail: text("support_email"),
  businessPhone: text("business_phone"),
  contactPerson: text("contact_person"),
  preferredLanguage: varchar("preferred_language", { length: 16 }),
  businessHours: jsonb("business_hours"),
  extraEmails: jsonb("extra_emails").$type<string[] | null>(),
})

/** Primary org address + map pin coordinates. */
export const organizationAddress = pgTable("organization_address", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  stateProvince: text("state_province"),
  city: text("city"),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  postalCode: text("postal_code"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  defaultLanguage: varchar("default_language", { length: 16 }),
  billingSameAsPrimary: boolean("billing_same_as_primary"),
})

export const organizationLegal = pgTable("organization_legal", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  legalBusinessName: text("legal_business_name"),
  legalEntityType: text("legal_entity_type"),
  registrationNumber: text("registration_number"),
  taxRegistrationStatus: text("tax_registration_status"),
  registeredAddress: jsonb("registered_address"),
  invoiceLegalName: text("invoice_legal_name"),
  skipped: boolean("skipped").default(false).notNull(),
})

export const organizationTax = pgTable("organization_tax", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  taxIdType: text("tax_id_type"),
  taxIdNumber: text("tax_id_number"),
  taxDocumentAssetId: text("tax_document_asset_id"),
  taxDocumentUrl: text("tax_document_url"),
})

export const organizationBranding = pgTable("organization_branding", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  displayName: text("display_name"),
  primaryLogoAssetId: text("primary_logo_asset_id"),
  secondaryLogoAssetId: text("secondary_logo_asset_id"),
  coverImageAssetId: text("cover_image_asset_id"),
  brandColor: varchar("brand_color", { length: 32 }),
  customDomain: text("custom_domain"),
  emailSignatureHtml: text("email_signature_html"),
  documentFooter: text("document_footer"),
})

export const organizationWorkspace = pgTable("organization_workspace", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  workspaceVisibility: varchar("workspace_visibility", { length: 16 }),
  defaultProjectVisibility: varchar("default_project_visibility", {
    length: 16,
  }),
  defaultMemberRole: varchar("default_member_role", { length: 16 }),
  projectNumberPrefix: text("project_number_prefix"),
  invoiceNumberPrefix: text("invoice_number_prefix"),
  defaultPaymentTerms: text("default_payment_terms"),
  defaultHourlyRate: integer("default_hourly_rate"),
  workweek: jsonb("workweek").$type<string[] | null>(),
  dateTimeFormat: text("date_time_format"),
  numberFormat: text("number_format"),
  fiscalYearStartMonth: integer("fiscal_year_start_month"),
})
