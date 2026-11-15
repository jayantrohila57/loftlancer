import type {
  AccountSectionKey,
  AccountSectionTabItem,
} from "../types/shell.account-section.types"
import type { ShellTranslate } from "./shell.messages"

export interface AccountSectionTabWithIcon extends AccountSectionTabItem {}

export function accountSectionTabs(
  translate: ShellTranslate
): Record<AccountSectionKey, readonly AccountSectionTabWithIcon[]> {
  return {
    unavailable: [],
    notifications: [
      {
        href: "/account/notifications",
        label: translate("overview"),
        value: "overview",
      },
    ],
    aiUsage: [
      {
        href: "/account/ai-usage",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/ai-usage/model-usage",
        label: translate("modelUsage"),
        value: "model-usage",
      },
      {
        href: "/account/ai-usage/usage-history",
        label: translate("usageHistory"),
        value: "usage-history",
      },
      {
        href: "/account/ai-usage/limits-alerts",
        label: translate("limitsAndAlerts"),
        value: "limits-alerts",
      },
    ],
    storage: [
      {
        href: "/account/storage",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/storage/files",
        label: translate("files"),
        value: "files",
      },
      {
        href: "/account/storage/storage-activity",
        label: translate("storageActivity"),
        value: "storage-activity",
      },
      {
        href: "/account/storage/trash",
        label: translate("trash"),
        value: "trash",
      },
    ],
    subscription: [
      {
        href: "/account/subscription",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/subscription/available-plans",
        label: translate("availablePlans"),
        value: "available-plans",
      },
      {
        href: "/account/subscription/usage-entitlements",
        label: translate("usageAndEntitlements"),
        value: "usage-entitlements",
      },
    ],
    billing: [
      {
        href: "/account/billing",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/billing/payment-methods",
        label: translate("paymentMethods"),
        value: "payment-methods",
      },
      {
        href: "/account/billing/payment-history",
        label: translate("paymentHistory"),
        value: "payment-history",
      },
      {
        href: "/account/billing/invoices",
        label: translate("invoices"),
        value: "invoices",
      },
      {
        href: "/account/billing/billing-details",
        label: translate("billingDetails"),
        value: "billing-details",
      },
    ],
    privacyData: [
      {
        href: "/account/privacy-data",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/privacy-data/consents",
        label: translate("consents"),
        value: "consents",
      },
      {
        href: "/account/privacy-data/data-export",
        label: translate("dataExport"),
        value: "data-export",
      },
      {
        href: "/account/privacy-data/account-deletion",
        label: translate("accountDeletion"),
        value: "account-deletion",
      },
    ],
    helpSupport: [
      {
        href: "/account/help-support",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/help-support/help-center",
        label: translate("helpCenter"),
        value: "help-center",
      },
      {
        href: "/account/help-support/support-tickets",
        label: translate("supportTickets"),
        value: "support-tickets",
      },
    ],
    home: [{ href: "/account", label: translate("browse"), value: "browse" }],
    overview: [
      {
        href: "/account/overview",
        label: translate("overview"),
        value: "overview",
      },
    ],
    profile: [
      {
        href: "/account/profile",
        label: translate("overview"),
        value: "general",
      },
    ],
    activity: [
      {
        href: "/account/activity",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/activity/account",
        label: translate("accountActivity"),
        value: "account",
      },
      {
        href: "/account/activity/security",
        label: translate("securityActivity"),
        value: "security",
      },
      {
        href: "/account/activity/resource",
        label: translate("resourceActivity"),
        value: "resource",
      },
    ],
    permissions: [
      {
        href: "/account/security/permissions",
        label: translate("general"),
        value: "general",
      },
    ],
    organization: [
      {
        href: "/account/organization",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/organization/members",
        label: translate("organizationMembers"),
        value: "members",
      },
      {
        href: "/account/organization/invitations",
        label: translate("organizationInvitations"),
        value: "invitations",
      },
    ],
    security: [
      {
        href: "/account/security",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/security/sessions",
        label: translate("sessions"),
        value: "sessions",
      },
      {
        href: "/account/security/connected-accounts",
        label: translate("connectedAccounts"),
        value: "connected-accounts",
      },
      {
        href: "/account/security/device-authorization",
        label: translate("deviceAuthorization"),
        value: "device-authorization",
      },
      {
        href: "/account/security/permissions",
        label: translate("permissions"),
        value: "permissions",
      },
    ],
    appearance: [
      {
        href: "/account/appearance",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/appearance/theme",
        label: translate("theme"),
        value: "theme",
      },
      {
        href: "/account/appearance/zoom",
        label: translate("zoomLevel"),
        value: "zoom",
      },
      {
        href: "/account/appearance/density",
        label: translate("interfaceDensity"),
        value: "density",
      },
      {
        href: "/account/appearance/sidebar",
        label: translate("sidebarBehavior"),
        value: "sidebar",
      },
    ],
    languageRegion: [
      {
        href: "/account/language-region",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/language-region/language",
        label: translate("language"),
        value: "language",
      },
      {
        href: "/account/language-region/region",
        label: translate("region"),
        value: "region",
      },
      {
        href: "/account/language-region/date-time",
        label: translate("dateAndTime"),
        value: "date-time",
      },
      {
        href: "/account/language-region/numbers",
        label: translate("numbers"),
        value: "numbers",
      },
      {
        href: "/account/language-region/currency",
        label: translate("currency"),
        value: "currency",
      },
      {
        href: "/account/language-region/measurements",
        label: translate("measurements"),
        value: "measurements",
      },
    ],
  }
}
