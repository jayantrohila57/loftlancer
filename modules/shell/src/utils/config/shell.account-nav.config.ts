import type { ShellSidebarNavSubItem } from "@features/shell"
import type { LucideIcon } from "lucide-react"
import {
  Activity,
  Bell,
  CalendarClock,
  CircleHelp,
  Database,
  Download,
  FileText,
  Globe,
  Languages,
  LayoutDashboard,
  Link2,
  Monitor,
  MousePointer2,
  Palette,
  Percent,
  Ruler,
  Settings2,
  Shield,
  Terminal,
  User,
  UserRoundX,
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
  permissions: Shield,
  theme: Palette,
  zoom: ZoomIn,
  density: Settings2,
  sidebar: MousePointer2,
  language: Languages,
  region: Globe,
  "date-time": CalendarClock,
  numbers: Percent,
  measurements: Ruler,
  consents: Shield,
  "data-export": Download,
  "account-deletion": UserRoundX,
  "legal-acceptance": FileText,
  "support-tickets": CircleHelp,
  "user-activity": Activity,
  activity: Activity,
  "data-management": Settings2,
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

export function accountSidebarNavGroups(
  translate: ShellTranslate
): readonly AccountSidebarNavGroup[] {
  const tabs = accountSectionTabs(translate)

  const navGroups: AccountSidebarNavGroup[] = [
    {
      label: translate("accountAndProfile"),
      items: [
        {
          href: "/account",
          icon: LayoutDashboard,
          label: translate("overview"),
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
          href: "/account/notifications",
          icon: Bell,
          label: translate("notifications"),
          subItems: tabs.notifications.map((tab) => ({
            href: tab.href,
            icon: tabIcons[tab.value] ?? LayoutDashboard,
            label: tab.label,
          })),
        },
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

  return navGroups
}
