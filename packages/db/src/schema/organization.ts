import { relations, sql } from "drizzle-orm";
import {
  boolean,
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { project } from "./projects";
import { softDeleteColumns } from "./soft-delete-columns";

export const organization = pgTable(
  "organization",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    logo: text("logo"),
    metadata: text("metadata"),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    archivedBy: text("archived_by").references(() => user.id, {
      onDelete: "set null",
    }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    deletedBy: text("deleted_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    uniqueIndex("organization_slug_active_uidx")
      .on(table.slug)
      .where(sql`${table.deletedAt} IS NULL`),
    index("organization_slug_idx").on(table.slug),
    index("organization_archived_at_idx")
      .on(table.archivedAt)
      .where(sql`${table.deletedAt} IS NULL`),
  ],
);

/** Private company/contact details used only on organization administration screens. */
export const organizationProfile = pgTable(
  "organization_profile",
  {
    organizationId: text("organization_id")
      .primaryKey()
      .references(() => organization.id, { onDelete: "cascade" }),
    description: text("description"),
    legalName: text("legal_name"),
    websiteUrl: text("website_url"),
    industry: text("industry"),
    sizeBand: text("size_band"),
    foundedYear: integer("founded_year"),
    contactEmail: text("contact_email"),
    contactPhone: text("contact_phone"),
    supportUrl: text("support_url"),
    countryCode: text("country_code"),
    region: text("region"),
    city: text("city"),
    postalCode: text("postal_code"),
    addressLine1: text("address_line_1"),
    addressLine2: text("address_line_2"),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedBy: text("updated_by").references(() => user.id, {
      onDelete: "set null",
    }),
  },
  (table) => [
    check(
      "organization_profile_size_band_check",
      sql`${table.sizeBand} IS NULL OR ${table.sizeBand} IN ('1-10', '11-50', '51-200', '201-1000', '1001+')`,
    ),
    check(
      "organization_profile_country_code_check",
      sql`${table.countryCode} IS NULL OR ${table.countryCode} ~ '^[A-Z]{2}$'`,
    ),
    check(
      "organization_profile_founded_year_check",
      sql`${table.foundedYear} IS NULL OR ${table.foundedYear} BETWEEN 1000 AND 9999`,
    ),
  ],
);

export const organizationSettings = pgTable("organization_settings", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  timeZone: text("time_zone").notNull().default("UTC"),
  locale: text("locale").notNull().default("en"),
  dateFormat: text("date_format").notNull().default("medium"),
  timeFormat: text("time_format").notNull().default("12h"),
  weekStart: integer("week_start").notNull().default(1),
  displayCurrency: text("display_currency").notNull().default("USD"),
  defaultProjectVisibility: text("default_project_visibility")
    .notNull()
    .default("private"),
  notificationDefaults: jsonb("notification_defaults")
    .$type<{ email: boolean; inApp: boolean; version: 1 }>()
    .notNull()
    .default({ email: true, inApp: true, version: 1 }),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedBy: text("updated_by").references(() => user.id, {
    onDelete: "set null",
  }),
});

/** Entitlements are written by trusted billing/admin services, never org owners. */
export const organizationEntitlement = pgTable(
  "organization_entitlement",
  {
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    featureKey: text("feature_key").notNull(),
    enabled: boolean("enabled").notNull().default(true),
    limit: integer("limit"),
    source: text("source").notNull().default("product_default"),
    reference: text("reference"),
    effectiveAt: timestamp("effective_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("organization_entitlement_feature_uidx").on(
      table.organizationId,
      table.featureKey,
    ),
  ],
);

export const organizationDomain = pgTable(
  "organization_domain",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    hostname: text("hostname").notNull(),
    purpose: text("purpose").notNull().default("email"),
    state: text("state").notNull().default("pending"),
    verificationTokenHash: text("verification_token_hash").notNull(),
    challengeExpiresAt: timestamp("challenge_expires_at", {
      withTimezone: true,
    }).notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdBy: text("created_by").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("organization_domain_org_idx").on(
      table.organizationId,
      table.createdAt,
    ),
    uniqueIndex("organization_domain_active_hostname_uidx")
      .on(table.hostname, table.purpose)
      .where(sql`${table.state} IN ('pending', 'verified', 'active')`),
    check(
      "organization_domain_purpose_check",
      sql`${table.purpose} IN ('email', 'workspace')`,
    ),
    check(
      "organization_domain_state_check",
      sql`${table.state} IN ('pending', 'verified', 'active', 'failed', 'revoked')`,
    ),
  ],
);

export const member = pgTable(
  "member",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    role: text("role").default("member").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    ...softDeleteColumns,
  },
  (table) => [
    uniqueIndex("member_organization_user_active_uidx")
      .on(table.organizationId, table.userId)
      .where(sql`${table.deletedAt} IS NULL`),
    index("member_user_id_idx").on(table.userId),
    index("member_organization_id_idx").on(table.organizationId),
  ],
);

export const invitation = pgTable(
  "invitation",
  {
    id: text("id").primaryKey(),
    organizationId: text("organization_id")
      .notNull()
      .references(() => organization.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").default("member").notNull(),
    status: text("status").default("pending").notNull(),
    expiresAt: timestamp("expires_at").notNull(),
    inviterId: text("inviter_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    teamId: text("team_id"),
    projectId: text("project_id").references(() => project.id, {
      onDelete: "cascade",
    }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    ...softDeleteColumns,
  },
  (table) => [
    index("invitation_organization_id_idx").on(table.organizationId),
    index("invitation_email_idx").on(table.email),
    index("invitation_project_id_idx").on(table.projectId),
  ],
);

export const organizationRelations = relations(
  organization,
  ({ many, one }) => ({
    members: many(member),
    invitations: many(invitation),
    profile: one(organizationProfile, {
      fields: [organization.id],
      references: [organizationProfile.organizationId],
    }),
  }),
);

export const organizationProfileRelations = relations(
  organizationProfile,
  ({ one }) => ({
    organization: one(organization, {
      fields: [organizationProfile.organizationId],
      references: [organization.id],
    }),
    updatedByUser: one(user, {
      fields: [organizationProfile.updatedBy],
      references: [user.id],
    }),
  }),
);

export const memberRelations = relations(member, ({ one }) => ({
  organization: one(organization, {
    fields: [member.organizationId],
    references: [organization.id],
  }),
  user: one(user, {
    fields: [member.userId],
    references: [user.id],
  }),
}));
