import {
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  varchar,
} from "drizzle-orm/pg-core"
import { organization } from "./organization.schema"

export const organizationType = pgEnum("organization_type", [
  "freelancer",
  "studio",
  "agency",
  "company",
])
export const organizationProfile = pgTable("organization_profile", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  type: organizationType("type").notNull(),
  description: text("description"),
  countryCode: varchar("country_code", { length: 2 }).notNull(),
  tagline: varchar("tagline", { length: 120 }),
  industry: text("industry"),
  category: text("category"),
  services: jsonb("services").$type<string[] | null>(),
  specializations: jsonb("specializations").$type<string[] | null>(),
  businessSize: text("business_size"),
  yearEstablished: integer("year_established"),
  website: text("website"),
  portfolioUrl: text("portfolio_url"),
  socialProfiles: jsonb("social_profiles").$type<
    { label?: string; url: string }[] | null
  >(),
})
export const organizationSettings = pgTable("organization_settings", {
  organizationId: text("organization_id")
    .primaryKey()
    .references(() => organization.id, { onDelete: "cascade" }),
  timezone: varchar("timezone", { length: 64 }).notNull(),
  currencyCode: varchar("currency_code", { length: 3 }).notNull(),
  defaultLanguage: varchar("default_language", { length: 16 }),
})
