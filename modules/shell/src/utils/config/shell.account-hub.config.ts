import type { LucideIcon } from "lucide-react"
import type { AccountSectionKey } from "../types/shell.account-section.types"
import { accountSidebarNavGroups } from "./shell.account-nav.config"
import { accountSectionTabs } from "./shell.account-section-tabs.client"
import type { ShellTranslate } from "./shell.messages"

export function sectionKeyForAccountNavHref(href: string): AccountSectionKey {
  if (href === "/account") return "overview"
  if (href === "/account/overview") return "overview"
  if (href === "/account/profile") return "profile"
  if (href === "/account/activity") return "activity"
  if (href === "/account/security") return "security"
  if (href.startsWith("/account/organization")) return "organization"
  if (href === "/account/notifications") return "notifications"
  if (href.startsWith("/account/language-region")) return "languageRegion"
  if (href.startsWith("/account/appearance")) return "appearance"
  if (href.startsWith("/account/ai-usage")) return "aiUsage"
  if (href.startsWith("/account/storage")) return "storage"
  if (href.startsWith("/account/subscription")) return "subscription"
  if (href.startsWith("/account/billing")) return "billing"
  if (href.startsWith("/account/privacy-data")) return "privacyData"
  if (href.startsWith("/account/help-support")) return "helpSupport"
  return "unavailable"
}

function accountHubDestinationDescriptions(
  translate: ShellTranslate
): Record<AccountSectionKey, Readonly<Record<string, string>>> {
  return {
    unavailable: {},
    notifications: {
      overview: translate("notificationsOverviewDescription"),
    },
    aiUsage: {
      overview: translate("aiUsageOverviewDescription"),
      "model-usage": translate("aiUsageModelUsageBlockedDescription"),
      "usage-history": translate("aiUsageHistoryDescription"),
      "limits-alerts": translate("aiUsageLimitsAlertsDescription"),
    },
    storage: {
      overview: translate("storageSummary"),
      files: translate("storageFilesSummary"),
      "storage-activity": translate("storageActivitySummary"),
      trash: translate("storageTrashSummary"),
    },
    subscription: {},
    billing: {
      overview: translate("billingOverviewDescription"),
    },
    privacyData: {
      consents: translate("managePrivacyConsentsDescription"),
      "data-export": translate("dataExportDescription"),
      "account-deletion": translate("accountDeletion"),
    },
    helpSupport: {
      overview: translate("helpSupportOverviewDescription"),
      "help-center": translate("helpCenterDescription"),
      "support-tickets": translate("helpSupportContactTabDescription"),
    },
    home: {
      browse: translate("accountShortcuts"),
    },
    overview: {
      overview: translate("accountOverviewDescription"),
    },
    profile: {
      general: translate("profileSummary"),
    },
    activity: {
      overview: translate("activityCategorySummary"),
      account: translate("reviewSupportedAccountChangesRecordedOnTheServer"),
      security: translate("loginActivitySummary"),
      resource: translate("resourceActivityUnavailable"),
    },
    permissions: {
      general: translate("permissionSummary"),
    },
    organization: {
      overview: translate("organizationSummary"),
      members: translate("organizationMembersSummary"),
      invitations: translate("organizationInvitationsSummary"),
    },
    security: {
      overview: translate("securitySummary"),
      sessions: translate("sessionSummary"),
      activity: translate("loginActivitySummary"),
      "connected-accounts": translate("providersSummary"),
      "device-authorization": translate("deviceAuthorizationPageDescription"),
      "user-activity": translate(
        "reviewSupportedAccountChangesRecordedOnTheServer"
      ),
      "data-management": translate("activityManagementSummary"),
      permissions: translate("permissionSummary"),
    },
    languageRegion: {
      overview: translate("languageRegionOverviewSummary"),
      language: translate("languageSummary"),
      region: translate("regionSummary"),
      "date-time": translate("dateTimeSummary"),
      numbers: translate("numbersSummary"),
      currency: translate("currencySummary"),
      measurements: translate("measurementsSummary"),
    },
    appearance: {
      overview: translate("appearanceOverviewSummary"),
      theme: translate("themeSummary"),
      zoom: translate("zoomLevelSummary"),
      density: translate("interfaceDensitySummary"),
      sidebar: translate("sidebarBehaviorSummary"),
    },
  }
}

/** Short summary for a sidebar tab or command destination matched by href. */
export function accountHubDestinationDescription(
  translate: ShellTranslate,
  href: string
): string {
  const sectionKey = sectionKeyForAccountNavHref(href)
  if (sectionKey === "unavailable") {
    return translate("featureNotAvailable")
  }

  const destinationDescriptions = accountHubDestinationDescriptions(translate)
  const sectionTabs = accountSectionTabs(translate)[sectionKey] ?? []
  const tab = sectionTabs.find((entry) => entry.href === href)
  const tabValue = tab?.value ?? href.split("/").at(-1) ?? "overview"
  const sectionDescriptions = destinationDescriptions[sectionKey]

  if (sectionDescriptions?.[tabValue]) {
    return sectionDescriptions[tabValue]
  }
  if (
    sectionTabs.length === 1 &&
    sectionTabs[0]?.href === href &&
    sectionDescriptions?.overview
  ) {
    return sectionDescriptions.overview
  }

  return translate("featureNotAvailable")
}

function accountHubCategoryDescriptions(
  translate: ShellTranslate
): Record<AccountSectionKey, string> {
  return {
    unavailable: translate("featureNotAvailable"),
    notifications: translate("notificationsOverviewDescription"),
    aiUsage: translate("aiUsageOverviewDescription"),
    storage: translate("storageCategorySummary"),
    subscription: translate("featureNotAvailable"),
    billing: translate("billingOverviewDescription"),
    privacyData: translate("managePrivacyConsentsExportAndAccountDeletion"),
    helpSupport: translate("helpSupportOverviewDescription"),
    home: translate("browseAccountAreasAndOpenAPage"),
    overview: translate("seeYourAccountAtAGlance"),
    profile: translate("profileCategorySummary"),
    activity: translate("activityCategorySummary"),
    permissions: translate("permissionsCategorySummary"),
    organization: translate("organizationCategorySummary"),
    security: translate("securityCategorySummary"),
    languageRegion: translate("languageRegionCategorySummary"),
    appearance: translate("appearanceCategorySummary"),
  }
}

/** Short summary for a top-level account nav item (sidebar section root). */
export function accountHubSectionDescription(
  translate: ShellTranslate,
  sectionHref: string
): string {
  return accountHubCategoryDescriptions(translate)[
    sectionKeyForAccountNavHref(sectionHref)
  ]
}

export interface AccountHubDestination {
  readonly description: string
  readonly href: string
  readonly label: string
}

export interface AccountHubCategory {
  readonly description: string
  readonly destinations: readonly AccountHubDestination[]
  readonly groupLabel: string
  readonly href: string
  readonly icon: LucideIcon
  readonly label: string
  readonly sectionKey: AccountSectionKey
}

export function accountHubCategories(
  translate: ShellTranslate
): readonly AccountHubCategory[] {
  const categoryDescriptions = accountHubCategoryDescriptions(translate)

  return accountSidebarNavGroups(translate).flatMap((group) =>
    group.items
      .filter((item) => item.href !== "/account")
      .map((item) => {
        const sectionKey = sectionKeyForAccountNavHref(item.href)
        const navDestinations =
          item.subItems && item.subItems.length > 0
            ? item.subItems
            : [{ href: item.href, icon: item.icon, label: item.label }]

        return {
          description: categoryDescriptions[sectionKey],
          destinations: navDestinations.map((entry) => ({
            description: accountHubDestinationDescription(
              translate,
              entry.href
            ),
            href: entry.href,
            label: entry.label,
          })),
          groupLabel: group.label,
          href: item.href,
          icon: item.icon,
          label: item.label,
          sectionKey,
        }
      })
  )
}

export interface AccountHubTile {
  readonly description: string
  readonly displayLabel: string
  readonly href: string
  readonly icon: LucideIcon
  readonly sectionKey: AccountSectionKey
}

function hubTileDisplayLabel(
  category: AccountHubCategory,
  destination: AccountHubDestination
): string {
  if (category.destinations.length === 1) {
    return category.label
  }

  return `${category.label} · ${destination.label}`
}

export function accountHubTiles(
  translate: ShellTranslate
): readonly AccountHubTile[] {
  return accountHubCategories(translate).flatMap((category) =>
    category.destinations.map((destination) => ({
      description: destination.description,
      displayLabel: hubTileDisplayLabel(category, destination),
      href: destination.href,
      icon: category.icon,
      sectionKey: category.sectionKey,
    }))
  )
}
