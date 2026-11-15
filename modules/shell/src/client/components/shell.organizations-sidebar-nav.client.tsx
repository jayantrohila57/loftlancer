"use client"

import { ShellSidebarNav } from "@features/shell"
import { Building2, LayoutDashboard, List, Mail } from "lucide-react"
import { useTranslations } from "next-intl"

export function OrganizationsSidebarNav() {
  const t = useTranslations("ui")
  return (
    <ShellSidebarNav
      groups={[
        {
          label: t("organizations"),
          items: [
            {
              href: "/organizations",
              icon: Building2,
              label: t("organizations"),
              subItems: [
                {
                  href: "/organizations",
                  icon: LayoutDashboard,
                  label: t("overview"),
                },
                {
                  href: "/organizations/list",
                  icon: List,
                  label: t("organizations"),
                },
                {
                  href: "/organizations/invitations",
                  icon: Mail,
                  label: t("organizationInvitations"),
                },
              ],
            },
          ],
        },
      ]}
    />
  )
}
