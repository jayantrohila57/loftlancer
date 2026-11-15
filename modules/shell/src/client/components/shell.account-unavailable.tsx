"use client"

import { stripLeadingLocaleFromPathname } from "@features/i18n/pathname"
import { useShellNavigation } from "@features/shell"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"
import { accountHubDestinationDescription } from "../../utils/config/shell.account-hub.config"
import { accountSectionTabs } from "../../utils/config/shell.account-section-tabs.client"
import type { ShellTranslate } from "../../utils/config/shell.messages"
import { ShellAccountBlockedEmpty } from "./shell.account-blocked-empty"
import {
  ShellAccountFrame,
  ShellAccountFrameSection,
} from "./shell.account-frame"

function unavailableDescription(
  translate: ShellTranslate,
  href: string
): string {
  return accountHubDestinationDescription(translate, href)
}

function UnavailablePage({
  description,
  title,
}: {
  readonly description: string
  readonly title: string
}) {
  const t = useTranslations("ui")
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection description={description} title={title}>
          <ShellAccountBlockedEmpty
            description={description}
            title={t("accountTabBlockedTitle")}
          />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}

export function AccountUnavailableTabPage() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  const { usePathname } = useShellNavigation()
  const pathname = stripLeadingLocaleFromPathname(usePathname())
  const tabs = accountSectionTabs(translate)
  const match = Object.values(tabs)
    .flat()
    .find((tab) => tab.href === pathname)
  const description = unavailableDescription(translate, pathname)
  return (
    <UnavailablePage
      description={description}
      title={match?.label ?? t("overview")}
    />
  )
}

export function NotificationsPage() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  const description = unavailableDescription(
    translate,
    "/account/notifications"
  )
  return (
    <UnavailablePage description={description} title={t("notifications")} />
  )
}
export function SubscriptionPage() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  const description = unavailableDescription(translate, "/account/subscription")
  return <UnavailablePage description={description} title={t("subscription")} />
}
export function BillingPage() {
  const t = useTranslations("ui")
  const translate = t as unknown as ShellTranslate
  const description = unavailableDescription(translate, "/account/billing")
  return <UnavailablePage description={description} title={t("billing")} />
}
export {
  OrgMembersScreen as OrganizationMembersPage,
  OrgOrganizationInvitationsScreen as OrganizationInvitationsPage,
} from "@modules/org"
