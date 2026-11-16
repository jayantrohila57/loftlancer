import {
  Activity,
  HardDrive,
  Home,
  Settings,
  Sparkles,
  WalletCards,
} from "lucide-react"
import {
  studioOrgPath,
  studioSettingsPath,
} from "@/shared/org/studio-org.paths"

type Translate = (key: string) => string

export function studioWorkspaceNavigationItems(input: {
  readonly slug: string | null
  readonly t: Translate
  readonly tCommand: Translate
}) {
  const { slug, t, tCommand } = input
  const href = (suffix = "") => (slug ? studioOrgPath(slug, suffix) : "/")
  const settingsHref = slug ? studioSettingsPath(slug, "/general") : "/settings"
  return [
    {
      description: tCommand("homeDescription"),
      groupId: "studio-workspace",
      groupLabel: t("studio"),
      href: href(),
      icon: Home,
      id: "home",
      label: t("home"),
      order: 0,
      placements: ["sidebar", "command"] as const,
      keywords: [t("home"), t("studio")],
    },
    {
      description: t("billingUsageEntitlementsDescription"),
      groupId: "studio-workspace",
      groupLabel: t("studio"),
      href: href("/usage"),
      icon: WalletCards,
      id: "usage",
      label: t("usageAndEntitlements"),
      order: 10,
      placements: ["sidebar", "command"] as const,
      keywords: [t("usageAndEntitlements"), t("storage"), t("aiUsage")],
    },
    {
      description: t("aiUsageOverviewDescription"),
      groupId: "studio-workspace",
      groupLabel: t("studio"),
      href: href("/usage/ai"),
      icon: Sparkles,
      id: "usage-ai",
      label: t("aiUsage"),
      order: 11,
      parentId: "usage",
      placements: ["sidebar", "command"] as const,
      keywords: [t("aiUsage"), t("modelUsage")],
    },
    {
      description: t("storageOverviewDescription"),
      groupId: "studio-workspace",
      groupLabel: t("studio"),
      href: href("/usage/storage"),
      icon: HardDrive,
      id: "usage-storage",
      label: t("storage"),
      order: 12,
      parentId: "usage",
      placements: ["sidebar", "command"] as const,
      keywords: [t("storage"), t("files")],
    },
    {
      description: t("resourceActivityUnavailable"),
      groupId: "studio-workspace",
      groupLabel: t("studio"),
      href: href("/activity"),
      icon: Activity,
      id: "activity",
      label: t("activity"),
      order: 20,
      placements: ["sidebar", "command"] as const,
      keywords: [t("activity"), t("resourceActivity")],
    },
    {
      description: t("organizationCategorySummary"),
      groupId: "studio-workspace",
      groupLabel: t("studio"),
      href: settingsHref,
      icon: Settings,
      id: "settings",
      label: t("organizationSettings"),
      order: 30,
      placements: ["sidebar", "command"] as const,
      keywords: [t("organizationSettings"), t("general"), t("billing")],
    },
  ]
}
