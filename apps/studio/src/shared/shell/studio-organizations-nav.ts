import { Building2, Mail, Plus } from "lucide-react"

type Translate = (key: string) => string

export function studioOrganizationsNavigationItems(input: {
  readonly t: Translate
  readonly tCommand: Translate
}) {
  const { t, tCommand } = input
  return [
    {
      description: t("organizationsDashboardDescription"),
      groupId: "studio-organizations",
      groupLabel: t("organizations"),
      href: "/organizations",
      icon: Building2,
      id: "organizations",
      label: t("organizations"),
      order: 0,
      placements: ["sidebar", "command"] as const,
      keywords: [t("organizations")],
    },
    {
      description: t("organizationCreateDescription"),
      groupId: "studio-organizations",
      groupLabel: t("organizations"),
      href: "/organizations/new",
      icon: Plus,
      id: "organizations-new",
      label: t("createOrganization"),
      order: 10,
      placements: ["sidebar", "command"] as const,
      keywords: [t("createOrganization")],
    },
    {
      description: tCommand("homeDescription"),
      groupId: "studio-organizations",
      groupLabel: t("organizations"),
      href: "/organizations/invitations",
      icon: Mail,
      id: "organizations-invitations",
      label: t("organizationInvitations"),
      order: 20,
      placements: ["sidebar", "command"] as const,
      keywords: [t("organizationInvitations")],
    },
  ]
}
