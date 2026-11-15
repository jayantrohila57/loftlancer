"use client"

import { useShellNavigation } from "@features/shell"
import {
  accountSectionTabs,
  ShellAccountFrame,
  ShellAccountFrameSection,
} from "@modules/shell"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@packages/ui/components/empty"
import Shell from "@packages/ui/components/shell"
import { Clock } from "lucide-react"
import { useTranslations } from "next-intl"

export function StoragePlaceholderTabPage() {
  const t = useTranslations("ui")
  const { usePathname } = useShellNavigation()
  const pathname = usePathname()
  const tabs = accountSectionTabs(t)
  const match = Object.values(tabs)
    .flat()
    .find((tab) => tab.href === pathname)

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("storageTabComingSoonDescription")}
          title={match?.label ?? t("storage")}
        >
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <Clock />
              </EmptyMedia>
              <EmptyTitle>{t("storageTabComingSoonTitle")}</EmptyTitle>
              <EmptyDescription>
                {t("storageTabComingSoonDescription")}
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
