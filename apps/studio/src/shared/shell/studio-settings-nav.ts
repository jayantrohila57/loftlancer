import type { NavigationItem } from "@features/navigation"
import {
  AlertTriangle,
  Building2,
  CreditCard,
  Mail,
  Settings,
  Shield,
  UserCog,
  WalletCards,
} from "lucide-react"
import { studioSettingsPath } from "@/shared/org/studio-org.paths"
import type { StudioOrgAccess } from "@/shared/org/studio-org-access"

type Translate = (key: string) => string

export function studioSettingsNavigationItems(input: {
  readonly slug: string | null
  readonly access: StudioOrgAccess | null
  readonly rolePending: boolean
  readonly t: Translate
}) {
  const { slug, access, rolePending, t } = input
  if (!slug) return []
  const href = (suffix: string) => studioSettingsPath(slug, suffix)
  const hideUntilKnown = rolePending
  const canMembers = hideUntilKnown ? false : Boolean(access?.canManageMembers)
  const canInvites = hideUntilKnown
    ? false
    : Boolean(access?.canManageInvitations)
  const canBilling = hideUntilKnown ? false : Boolean(access?.canManageBilling)
  const canOwner = hideUntilKnown
    ? false
    : Boolean(access?.canTransferOwnership)
  const canDanger = hideUntilKnown ? false : Boolean(access?.canAccessDanger)

  const items: NavigationItem[] = [
    {
      description: t("organizationSummary"),
      groupId: "studio-settings",
      groupLabel: t("organizationSettings"),
      href: href("/general"),
      icon: Settings,
      id: "settings-general",
      label: t("general"),
      order: 0,
      placements: ["sidebar", "command"] as const,
      keywords: [t("general"), t("organizationSettings")],
    },
  ]

  if (canMembers) {
    items.push({
      description: t("organizationMembersSummary"),
      groupId: "studio-settings",
      groupLabel: t("organizationSettings"),
      href: href("/members"),
      icon: Building2,
      id: "settings-members",
      label: t("organizationMembers"),
      order: 10,
      placements: ["sidebar", "command"] as const,
      keywords: [t("organizationMembers")],
    })
  }
  if (canInvites) {
    items.push({
      description: t("organizationInvitationsSummary"),
      groupId: "studio-settings",
      groupLabel: t("organizationSettings"),
      href: href("/invitations"),
      icon: Mail,
      id: "settings-invitations",
      label: t("organizationInvitations"),
      order: 20,
      placements: ["sidebar", "command"] as const,
      keywords: [t("organizationInvitations")],
    })
  }

  items.push({
    description: t("organizationRolesDescription"),
    groupId: "studio-settings",
    groupLabel: t("organizationSettings"),
    href: href("/roles"),
    icon: Shield,
    id: "settings-roles",
    label: t("organizationRoles"),
    order: 30,
    placements: ["sidebar", "command"] as const,
    keywords: [t("organizationRoles")],
  })

  if (canBilling) {
    items.push(
      {
        description: t("billingOverviewDescription"),
        groupId: "studio-settings",
        groupLabel: t("organizationSettings"),
        href: href("/billing"),
        icon: CreditCard,
        id: "settings-billing",
        label: t("billing"),
        order: 40,
        placements: ["sidebar", "command"] as const,
        keywords: [t("billing"), t("subscription"), t("invoices")],
      },
      {
        description: t("billingPlansDescription"),
        groupId: "studio-settings",
        groupLabel: t("organizationSettings"),
        href: href("/billing/plans"),
        icon: WalletCards,
        id: "settings-billing-plans",
        label: t("availablePlans"),
        order: 41,
        parentId: "settings-billing",
        placements: ["sidebar", "command"] as const,
        keywords: [t("availablePlans")],
      },
      {
        description: t("billingUsageEntitlementsDescription"),
        groupId: "studio-settings",
        groupLabel: t("organizationSettings"),
        href: href("/billing/usage-entitlements"),
        icon: WalletCards,
        id: "settings-billing-usage-entitlements",
        label: t("usageAndEntitlements"),
        order: 42,
        parentId: "settings-billing",
        placements: ["sidebar", "command"] as const,
        keywords: [t("usageAndEntitlements")],
      },
      {
        description: t("billingPaymentMethodsDescription"),
        groupId: "studio-settings",
        groupLabel: t("organizationSettings"),
        href: href("/billing/payment-methods"),
        icon: CreditCard,
        id: "settings-billing-payment-methods",
        label: t("paymentMethods"),
        order: 43,
        parentId: "settings-billing",
        placements: ["sidebar", "command"] as const,
        keywords: [t("paymentMethods")],
      },
      {
        description: t("paymentHistory"),
        groupId: "studio-settings",
        groupLabel: t("organizationSettings"),
        href: href("/billing/payment-history"),
        icon: CreditCard,
        id: "settings-billing-payment-history",
        label: t("paymentHistory"),
        order: 44,
        parentId: "settings-billing",
        placements: ["sidebar", "command"] as const,
        keywords: [t("paymentHistory")],
      },
      {
        description: t("billingInvoicesDescription"),
        groupId: "studio-settings",
        groupLabel: t("organizationSettings"),
        href: href("/billing/invoices"),
        icon: CreditCard,
        id: "settings-billing-invoices",
        label: t("invoices"),
        order: 45,
        parentId: "settings-billing",
        placements: ["sidebar", "command"] as const,
        keywords: [t("invoices")],
      },
      {
        description: t("billingDetailsDescription"),
        groupId: "studio-settings",
        groupLabel: t("organizationSettings"),
        href: href("/billing/details"),
        icon: CreditCard,
        id: "settings-billing-details",
        label: t("billingDetails"),
        order: 46,
        parentId: "settings-billing",
        placements: ["sidebar", "command"] as const,
        keywords: [t("billingDetails")],
      }
    )
  }

  if (canOwner) {
    items.push({
      description: t("transferOwnershipDescription"),
      groupId: "studio-settings",
      groupLabel: t("organizationSettings"),
      href: href("/ownership"),
      icon: UserCog,
      id: "settings-ownership",
      label: t("transferOwnership"),
      order: 50,
      placements: ["sidebar", "command"] as const,
      keywords: [t("transferOwnership")],
    })
  }
  if (canDanger) {
    items.push({
      description: t("dangerZoneDescription"),
      groupId: "studio-settings",
      groupLabel: t("organizationSettings"),
      href: href("/danger"),
      icon: AlertTriangle,
      id: "settings-danger",
      label: t("dangerZone"),
      order: 60,
      placements: ["sidebar", "command"] as const,
      keywords: [t("dangerZone")],
    })
  }

  return items
}
