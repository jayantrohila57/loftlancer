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
    aiUsage: [],
    storage: [],
    subscription: [],
    billing: [],
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
        href: "/account/privacy-data/legal-acceptance",
        label: translate("legalAcceptanceHistory"),
        value: "legal-acceptance",
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
        href: "/account/help-support/support-tickets",
        label: translate("supportTickets"),
        value: "support-tickets",
      },
    ],
    home: [{ href: "/account", label: translate("browse"), value: "browse" }],
    overview: [
      {
        href: "/account",
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
    activity: [],
    permissions: [],
    organization: [],
    security: [
      {
        href: "/account/security",
        label: translate("overview"),
        value: "overview",
      },
      {
        href: "/account/security/connected-accounts",
        label: translate("signInMethods"),
        value: "connected-accounts",
      },
      {
        href: "/account/security/sessions",
        label: translate("sessions"),
        value: "sessions",
      },
      {
        href: "/account/security/device-authorization",
        label: translate("deviceAuthorization"),
        value: "device-authorization",
      },
      {
        href: "/account/security/user-activity",
        label: translate("accountActivity"),
        value: "user-activity",
      },
      {
        href: "/account/security/activity",
        label: translate("securityActivity"),
        value: "activity",
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
