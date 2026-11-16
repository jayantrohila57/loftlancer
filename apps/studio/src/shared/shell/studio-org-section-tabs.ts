import type { ShellSectionTabItem } from "@features/shell"
import {
  studioOrgPath,
  studioSettingsPath,
} from "@/shared/org/studio-org.paths"
import type { StudioOrgAccess } from "@/shared/org/studio-org-access"

type Translate = (key: string) => string

export function studioOrganizationsSectionTabs(
  t: Translate
): readonly ShellSectionTabItem[] {
  return [
    {
      href: "/organizations",
      label: t("organizations"),
      value: "organizations",
    },
    {
      href: "/organizations/new",
      label: t("createOrganization"),
      value: "new",
    },
    {
      href: "/organizations/invitations",
      label: t("organizationInvitations"),
      value: "invitations",
    },
  ]
}

export function studioBillingSectionTabs(
  org: string,
  t: Translate
): readonly ShellSectionTabItem[] {
  return [
    {
      href: studioSettingsPath(org, "/billing"),
      label: t("overview"),
      value: "overview",
    },
    {
      href: studioSettingsPath(org, "/billing/plans"),
      label: t("availablePlans"),
      value: "plans",
    },
    {
      href: studioSettingsPath(org, "/billing/usage-entitlements"),
      label: t("usageAndEntitlements"),
      value: "usage-entitlements",
    },
    {
      href: studioSettingsPath(org, "/billing/payment-methods"),
      label: t("paymentMethods"),
      value: "payment-methods",
    },
    {
      href: studioSettingsPath(org, "/billing/payment-history"),
      label: t("paymentHistory"),
      value: "payment-history",
    },
    {
      href: studioSettingsPath(org, "/billing/invoices"),
      label: t("invoices"),
      value: "invoices",
    },
    {
      href: studioSettingsPath(org, "/billing/details"),
      label: t("billingDetails"),
      value: "billing-details",
    },
  ]
}

export function studioUsageSectionTabs(
  org: string,
  t: Translate
): readonly ShellSectionTabItem[] {
  return [
    {
      href: studioOrgPath(org, "/usage"),
      label: t("overview"),
      value: "overview",
    },
    {
      href: studioOrgPath(org, "/usage/ai"),
      label: t("aiUsage"),
      value: "ai",
    },
    {
      href: studioOrgPath(org, "/usage/storage"),
      label: t("storage"),
      value: "storage",
    },
  ]
}

export function studioSettingsSectionTabs(
  org: string,
  t: Translate,
  access?: StudioOrgAccess
): readonly ShellSectionTabItem[] {
  const tabs: ShellSectionTabItem[] = [
    {
      href: studioSettingsPath(org, "/general"),
      label: t("general"),
      value: "general",
    },
  ]
  if (!access || access.canManageMembers) {
    tabs.push({
      href: studioSettingsPath(org, "/members"),
      label: t("organizationMembers"),
      value: "members",
    })
  }
  if (!access || access.canManageInvitations) {
    tabs.push({
      href: studioSettingsPath(org, "/invitations"),
      label: t("organizationInvitations"),
      value: "invitations",
    })
  }
  tabs.push({
    href: studioSettingsPath(org, "/roles"),
    label: t("organizationRoles"),
    value: "roles",
  })
  if (!access || access.canManageBilling) {
    tabs.push({
      href: studioSettingsPath(org, "/billing"),
      label: t("billing"),
      value: "billing",
    })
  }
  if (!access || access.canTransferOwnership) {
    tabs.push({
      href: studioSettingsPath(org, "/ownership"),
      label: t("transferOwnership"),
      value: "ownership",
    })
  }
  if (!access || access.canAccessDanger) {
    tabs.push({
      href: studioSettingsPath(org, "/danger"),
      label: t("dangerZone"),
      value: "danger",
    })
  }
  return tabs
}

export function studioAiUsageSectionTabs(
  org: string,
  t: Translate
): readonly ShellSectionTabItem[] {
  return [
    {
      href: studioOrgPath(org, "/usage/ai"),
      label: t("overview"),
      value: "overview",
    },
    {
      href: studioOrgPath(org, "/usage/ai/model-usage"),
      label: t("modelUsage"),
      value: "model-usage",
    },
    {
      href: studioOrgPath(org, "/usage/ai/usage-history"),
      label: t("usageHistory"),
      value: "usage-history",
    },
    {
      href: studioOrgPath(org, "/usage/ai/limits-alerts"),
      label: t("limitsAndAlerts"),
      value: "limits-alerts",
    },
  ]
}

export function studioStorageSectionTabs(
  org: string,
  t: Translate
): readonly ShellSectionTabItem[] {
  return [
    {
      href: studioOrgPath(org, "/usage/storage"),
      label: t("overview"),
      value: "overview",
    },
    {
      href: studioOrgPath(org, "/usage/storage/files"),
      label: t("files"),
      value: "files",
    },
    {
      href: studioOrgPath(org, "/usage/storage/storage-activity"),
      label: t("storageActivity"),
      value: "storage-activity",
    },
    {
      href: studioOrgPath(org, "/usage/storage/trash"),
      label: t("trash"),
      value: "trash",
    },
  ]
}
