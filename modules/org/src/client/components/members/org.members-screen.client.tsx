"use client"

import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@packages/ui/components/frame"
import Shell from "@packages/ui/components/shell"
import { useTranslations } from "next-intl"

import { OrgMembers } from "./org.members.client"

export function OrgMembersScreen() {
  const t = useTranslations("ui")
  return (
    <Shell.Section variant="dashboard">
      <Frame>
        <FrameHeader>
          <FrameTitle>{t("organizationMembers")}</FrameTitle>
          <FrameDescription>{t("organizationMembersSummary")}</FrameDescription>
        </FrameHeader>
        <FramePanel>
          <OrgMembers />
        </FramePanel>
      </Frame>
    </Shell.Section>
  )
}
