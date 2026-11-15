import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@packages/ui/components/frame"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { OrgList } from "./org.list.client"

export function OrgListScreen() {
  const t = useTranslations("ui")
  return (
    <Shell.Section variant="dashboard">
      <Frame>
        <FrameHeader>
          <FrameTitle>{t("organizations")}</FrameTitle>
          <FrameDescription>
            {t("organizationsDashboardDescription")}
          </FrameDescription>
        </FrameHeader>
        <FramePanel>
          <OrgList />
        </FramePanel>
      </Frame>
    </Shell.Section>
  )
}
