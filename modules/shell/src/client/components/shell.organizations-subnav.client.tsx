"use client"

import { ShellSectionSubnav } from "@features/shell"
import { useTranslations } from "next-intl"

export function OrganizationsSubnav() {
  const t = useTranslations("ui")
  return (
    <ShellSectionSubnav
      tabs={[
        {
          href: "/organizations",
          label: t("overview"),
          value: "overview",
        },
        {
          href: "/organizations/list",
          label: t("organizations"),
          value: "organizations",
        },
        {
          href: "/organizations/invitations",
          label: t("organizationInvitations"),
          value: "invitations",
        },
      ]}
    />
  )
}
