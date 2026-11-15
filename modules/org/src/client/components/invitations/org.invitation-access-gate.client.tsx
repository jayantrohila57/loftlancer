"use client"

import { useShellNavigation } from "@features/shell"
import { Button } from "@packages/ui/components/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import { Mail } from "lucide-react"
import { useTranslations } from "next-intl"
import type { ReactNode } from "react"
import { isOrganizationOwnerRole } from "../../../utils/org.member-role"
import {
  useOrgActiveMemberRole,
  useOrgSessionActiveId,
} from "../../hooks/org.session.client"

export function OrgInvitationAccessGate(props: { children: ReactNode }) {
  const t = useTranslations("ui")
  const { Link } = useShellNavigation()
  const organizationId = useOrgSessionActiveId()
  const { role, isPending: rolePending } = useOrgActiveMemberRole()

  if (!organizationId) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Mail />
          </EmptyMedia>
          <EmptyTitle>
            {t("organizationInvitationsNoActiveOrgTitle")}
          </EmptyTitle>
          <EmptyDescription>
            {t("organizationInvitationsNoActiveOrgDescription")}
          </EmptyDescription>
        </EmptyHeader>
        <Button render={<Link href="/organizations/list" />}>
          {t("organizations")}
        </Button>
      </Empty>
    )
  }

  if (!rolePending && (!role || !isOrganizationOwnerRole(role))) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Mail />
          </EmptyMedia>
          <EmptyTitle>{t("organizationInvitationsOwnerOnlyTitle")}</EmptyTitle>
          <EmptyDescription>
            {t("organizationInvitationsOwnerOnlyDescription")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  if (rolePending) return null

  return props.children
}
