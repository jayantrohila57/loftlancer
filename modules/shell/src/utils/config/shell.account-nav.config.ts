import type { ShellSidebarNavSubItem } from "@features/shell"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  BadgeCheck,
  Bell,
  Bot,
  Building2,
  CalendarClock,
  ChartNoAxesCombined,
  CircleHelp,
  Clock,
  CreditCard,
  Database,
  Download,
  File,
  FileText,
  Globe,
  HardDrive,
  History,
  Languages,
  LayoutDashboard,
  Link2,
  ListChecks,
  Mail,
  Monitor,
  MousePointer2,
  Palette,
  Percent,
  Receipt,
  Ruler,
  Settings2,
  Shield,
  Sparkles,
  Terminal,
  Trash2,
  User,
  UserRoundX,
  Users,
  WalletCards,
  ZoomIn,
} from "lucide-react"
import { accountSectionTabs } from "./shell.account-section-tabs.client"
import type { ShellTranslate } from "./shell.messages"

const tabIcons: Readonly<Record<string, LucideIcon>> = {
  overview: LayoutDashboard,
  account: User,
  security: Shield,
  resource: Database,
  sessions: Monitor,
  "connected-accounts": Link2,
  "device-authorization": Terminal,
  permissions: BadgeCheck,
  theme: Palette,
  zoom: ZoomIn,
  density: Settings2,
  sidebar: MousePointer2,
  language: Languages,
  region: Globe,
  "date-time": CalendarClock,
  numbers: Percent,
  currency: WalletCards,
  measurements: Ruler,
  "model-usage": Bot,
  "usage-history": History,
  "limits-alerts": Bell,
  files: File,
  "storage-activity": Activity,
  trash: Trash2,
  "available-plans": ListChecks,
  "usage-entitlements": ChartNoAxesCombined,
  "payment-methods": CreditCard,
  "payment-history": Clock,
  invoices: Receipt,
  "billing-details": FileText,
  consents: BadgeCheck,
  "data-export": Download,
  "account-deletion": UserRoundX,
  "help-center": CircleHelp,
  "support-tickets": FileText,
  members: Users,
  invitations: Mail,
}

export interface AccountSidebarNavItem {
  readonly href: string
  readonly icon: LucideIcon
  readonly label: string
  readonly subItems?: readonly ShellSidebarNavSubItem[]
}
export interface AccountSidebarNavGroup {
  readonly items: readonly AccountSidebarNavItem[]
  readonly label: string
}

export type AccountSidebarNavOptions = {
  readonly showBillingNav?: boolean
}

export function accountSidebarNavGroups(
  translate: ShellTranslate,
  options?: AccountSidebarNavOptions
): readonly AccountSidebarNavGroup[] {
  const tabs = accountSectionTabs(translate)
  const showBillingNav = options?.showBillingNav !== false

  const navGroups: AccountSidebarNavGroup[] = [
    {
      label: translate("accountAndProfile"),
      items: [
        {
          href: "/account",
          icon: LayoutDashboard,
          label: translate("account"),
        },
        {
          href: "/account/organization",
          icon: Building2,
          label: translate("organization"),
          subItems: tabs.organization.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
        {
          href: "/account/profile",
          icon: User,
          label: translate("profile"),
          subItems: tabs.profile.map((tab) => ({
            href: tab.href,
            icon: LayoutDashboard,
            label: tab.label,
          })),
        },
      ],
    },
    {
      label: translate("securityAndActivity"),
      items: [
        {
          href: "/account/activity",
          icon: Activity,
          label: translate("activity"),
          subItems: tabs.activity.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
        {
          href: "/account/security",
          icon: Shield,
          label: translate("security"),
          subItems: tabs.security.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
      ],
    },
    {
      label: translate("personalization"),
      items: [
        {
          href: "/account/appearance",
          icon: Palette,
          label: translate("appearance"),
          subItems: tabs.appearance.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
        {
          href: "/account/language-region",
          icon: Languages,
          label: translate("languageRegion"),
          subItems: tabs.languageRegion.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
        {
          href: "/account/notifications",
          icon: Bell,
          label: translate("notifications"),
          subItems: tabs.notifications.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
      ],
    },
    {
      label: translate("resources"),
      items: [
        {
          href: "/account/ai-usage",
          icon: Sparkles,
          label: translate("aiUsage"),
          subItems: tabs.aiUsage.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
        {
          href: "/account/storage",
          icon: HardDrive,
          label: translate("storage"),
          subItems: tabs.storage.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
      ],
    },
    {
      label: translate("privacyAndSupport"),
      items: [
        {
          href: "/account/privacy-data",
          icon: Database,
          label: translate("privacyAndData"),
          subItems: tabs.privacyData.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
        {
          href: "/account/help-support",
          icon: CircleHelp,
          label: translate("helpAndSupport"),
          subItems: tabs.helpSupport.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
      ],
    },
  ]

  if (showBillingNav) {
    navGroups.splice(4, 0, {
      label: translate("plansAndBilling"),
      items: [
        {
          href: "/account/subscription",
          icon: WalletCards,
          label: translate("subscription"),
          subItems: tabs.subscription.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
        {
          href: "/account/billing",
          icon: CreditCard,
          label: translate("billing"),
          subItems: tabs.billing.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
      ],
    })
  }

  return navGroups
}
