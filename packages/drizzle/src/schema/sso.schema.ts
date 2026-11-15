import { relations } from "drizzle-orm"
import { index, pgTable, text } from "drizzle-orm/pg-core"

import { user } from "./auth.schema"

export const ssoProvider = pgTable(
  "sso_provider",
  {
    id: text("id").primaryKey(),
    issuer: text("issuer").notNull(),
    oidcConfig: text("oidc_config"),
    samlConfig: text("saml_config"),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    providerId: text("provider_id").notNull().unique(),
    organizationId: text("organization_id"),
    domain: text("domain").notNull(),
  },
  (table) => [
    index("sso_provider_userId_idx").on(table.userId),
    index("sso_provider_domain_idx").on(table.domain),
  ]
)

export const ssoProviderRelations = relations(ssoProvider, ({ one }) => ({
  user: one(user, {
    fields: [ssoProvider.userId],
    references: [user.id],
  }),
}))
