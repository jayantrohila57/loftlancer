import { z } from "zod"

const empty = z.object({}).strict()
const preferenceFields = z
  .array(
    z.enum([
      "language",
      "region",
      "timeZone",
      "dateStyle",
      "hourCycle",
      "currency",
      "numberGrouping",
      "measurementSystem",
    ])
  )
  .max(8)
const appearanceFields = z
  .array(z.enum(["theme", "interfaceDensity", "sidebarBehavior", "zoomLevel"]))
  .max(4)
const notificationFields = z
  .array(
    z.enum([
      "billingEmailEnabled",
      "organizationInvitesEnabled",
      "productEmailEnabled",
    ])
  )
  .max(3)
const privacyConsentFields = z
  .array(z.enum(["marketingEmailEnabled", "analyticsEnabled"]))
  .max(2)
const locationChange = z.object({ locationEnabled: z.boolean() }).strict()

/** Registration is server-owned; add a schema and safe target for each new action. */
export const activityActions = {
  "account.profile.update": {
    category: "account",
    metadata: empty,
    target: "account.profile",
  },
  "account.avatar.update": {
    category: "account",
    metadata: empty,
    target: "account.profile",
  },
  "account.avatar.remove": {
    category: "account",
    metadata: empty,
    target: "account.profile",
  },
  "auth.sign_in": {
    category: "authentication",
    metadata: empty,
    target: "account.sessions",
  },
  "auth.sign_out": {
    category: "authentication",
    metadata: empty,
    target: "account.sessions",
  },
  "auth.session.revoke": {
    category: "authentication",
    metadata: empty,
    target: "account.sessions",
  },
  "auth.session.end": {
    category: "authentication",
    metadata: empty,
    target: "account.sessions",
  },
  "security.provider.unlink": {
    category: "security",
    metadata: empty,
    target: "account.providers",
  },
  "security.device_authorization.approve": {
    category: "security",
    metadata: z
      .object({
        clientId: z.string().min(1).max(128).optional(),
        scope: z.string().max(256).optional(),
      })
      .strict(),
    target: "account.security.device-authorization",
  },
  "security.device_authorization.deny": {
    category: "security",
    metadata: z
      .object({
        clientId: z.string().min(1).max(128).optional(),
      })
      .strict(),
    target: "account.security.device-authorization",
  },
  "security.provider.link": {
    category: "security",
    metadata: z
      .object({
        providerId: z
          .string()
          .min(1)
          .max(50)
          .regex(/^[a-z0-9_-]+$/i),
      })
      .strict(),
    target: "account.providers",
  },
  "security.account.delete": {
    category: "security",
    metadata: empty,
    target: "account.deletion",
  },
  "privacy.location_preference.update": {
    category: "privacy",
    metadata: empty,
    changes: locationChange,
    target: "account.permissions",
  },
  "privacy.location_history.delete": {
    category: "privacy",
    metadata: empty,
    target: "account.permissions",
  },
  "notifications.preference.update": {
    category: "preferences",
    metadata: z.object({ changedFields: notificationFields }).strict(),
    target: "account.notifications",
  },
  "privacy.consent.update": {
    category: "privacy",
    metadata: z.object({ changedFields: privacyConsentFields }).strict(),
    target: "account.privacy-data.consents",
  },
  "privacy.data_export.request": {
    category: "privacy",
    metadata: z.object({ requestId: z.string().min(1) }).strict(),
    target: "account.privacy-data.data-export",
  },
  "preferences.regional.update": {
    category: "preferences",
    metadata: z.object({ changedFields: preferenceFields }).strict(),
    target: "account.regional",
  },
  "preferences.appearance.update": {
    category: "preferences",
    metadata: z.object({ changedFields: appearanceFields }).strict(),
    target: "account.appearance",
  },
  "admin.users.list": {
    category: "administration",
    metadata: z
      .object({
        limit: z.number().int().nonnegative(),
        offset: z.number().int().nonnegative(),
        total: z.number().int().nonnegative().optional(),
      })
      .strict(),
    target: "console.users",
  },
  "admin.users.ban": {
    category: "administration",
    metadata: z
      .object({
        banExpiresIn: z.number().int().nonnegative().nullable().optional(),
        hasReason: z.boolean().optional(),
      })
      .strict(),
    target: "console.users",
  },
  "admin.users.unban": {
    category: "administration",
    metadata: z.object({}).strict(),
    target: "console.users",
  },
  "admin.sso.connections.list": {
    category: "administration",
    metadata: z
      .object({
        total: z.number().int().nonnegative().optional(),
      })
      .strict(),
    target: "console.sso",
  },
  "billing.plan_changed": {
    category: "billing",
    metadata: z
      .object({
        organizationId: z.string().min(1),
        source: z.enum(["webhook", "upgrade", "downgrade"]),
      })
      .strict(),
    changes: z
      .object({
        planTier: z.enum(["free", "paid"]),
      })
      .strict(),
    target: "account.billing",
  },
  "storage.upload": {
    category: "resource",
    metadata: z
      .object({
        organizationId: z.string().min(1),
        itemId: z.string().min(1),
        displayName: z.string().min(1).max(256),
        byteSize: z.number().int().nonnegative(),
      })
      .strict(),
    target: "account.storage",
  },
  "storage.quota_denied": {
    category: "resource",
    metadata: z
      .object({
        organizationId: z.string().min(1),
        byteSize: z.number().int().nonnegative(),
      })
      .strict(),
    target: "account.storage",
  },
  "storage.delete": {
    category: "resource",
    metadata: z
      .object({
        organizationId: z.string().min(1),
        itemId: z.string().min(1),
        displayName: z.string().min(1).max(256),
      })
      .strict(),
    target: "account.storage",
  },
  "storage.restore": {
    category: "resource",
    metadata: z
      .object({
        organizationId: z.string().min(1),
        itemId: z.string().min(1),
        displayName: z.string().min(1).max(256),
        restoredToRoot: z.boolean().optional(),
      })
      .strict(),
    target: "account.storage",
  },
  "storage.grant.create": {
    category: "resource",
    metadata: z
      .object({
        organizationId: z.string().min(1),
        grantId: z.string().min(1),
        granteeUserId: z.string().min(1),
      })
      .strict(),
    target: "account.storage",
  },
  "storage.grant.revoke": {
    category: "resource",
    metadata: z
      .object({
        organizationId: z.string().min(1),
        grantId: z.string().min(1),
      })
      .strict(),
    target: "account.storage",
  },
  "storage.purge": {
    category: "resource",
    metadata: z
      .object({
        organizationId: z.string().min(1),
        itemId: z.string().min(1),
      })
      .strict(),
    target: "account.storage",
  },
} as const

export type ActivityActionId = keyof typeof activityActions
export function getActivityAction(value: string):
  | {
      category: string
      metadata: z.ZodType<Record<string, unknown>>
      target: string
      changes?: z.ZodType<Record<string, unknown>>
    }
  | undefined {
  return Object.hasOwn(activityActions, value)
    ? activityActions[value as ActivityActionId]
    : undefined
}
export const activityTargetPaths: Readonly<Record<string, string>> = {
  "account.billing": "/account/billing",
  "account.profile": "/account/profile",
  "account.sessions": "/account/security/sessions",
  "account.providers": "/account/security/connected-accounts",
  "account.permissions": "/account/security/permissions",
  "account.security.device-authorization":
    "/account/security/device-authorization",
  "account.regional": "/account/language-region",
  "account.appearance": "/account/appearance",
  "account.deletion": "/account/privacy-data/account-deletion",
  "account.storage": "/account/storage",
}

/** Safe read-only destination when per-resource access is not resolved yet. */
export const activityResourceListPath = "/account/activity/resource" as const

/** Console app route suffixes (cross-app; requires current administrator access). */
export const activityConsoleTargetSegments: Readonly<Record<string, string>> = {
  "console.users": "/users",
  "console.sso": "/sso",
}
