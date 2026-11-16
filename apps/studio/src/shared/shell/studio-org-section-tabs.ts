import type { ShellSectionTabItem } from "@features/shell"
import { studioOrgPath } from "@/shared/org/studio-org.paths"

type Translate = (key: string) => string

export function studioBillingSectionTabs(
  org: string,
  t: Translate
): readonly ShellSectionTabItem[] {
  return [
    {
      href: studioOrgPath(org, "/billing"),
      label: t("overview"),
      value: "overview",
    },
    {
      href: studioOrgPath(org, "/billing/plans"),
      label: t("availablePlans"),
      value: "plans",
    },
    {
      href: studioOrgPath(org, "/billing/payment-methods"),
      label: t("paymentMethods"),
      value: "payment-methods",
    },
    {
      href: studioOrgPath(org, "/billing/payment-history"),
      label: t("paymentHistory"),
      value: "payment-history",
    },
    {
      href: studioOrgPath(org, "/billing/invoices"),
      label: t("invoices"),
      value: "invoices",
    },
    {
      href: studioOrgPath(org, "/billing/details"),
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
  t: Translate
): readonly ShellSectionTabItem[] {
  return [
    {
      href: studioOrgPath(org, "/settings/general"),
      label: t("general"),
      value: "general",
    },
    {
      href: studioOrgPath(org, "/settings/members"),
      label: t("organizationMembers"),
      value: "members",
    },
    {
      href: studioOrgPath(org, "/settings/members/invitations"),
      label: t("organizationInvitations"),
      value: "invitations",
    },
    {
      href: studioOrgPath(org, "/settings/roles"),
      label: t("organizationRoles"),
      value: "roles",
    },
    {
      href: studioOrgPath(org, "/settings/ownership"),
      label: t("transferOwnership"),
      value: "ownership",
    },
    {
      href: studioOrgPath(org, "/settings/danger"),
      label: t("dangerZone"),
      value: "danger",
    },
  ]
}
