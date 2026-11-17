import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { getTranslations } from "next-intl/server"

import { HelpSupportTicketsScreen } from "./help.support-tickets.client"

export async function HelpSupportContactPage() {
  const t = await getTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("helpSupportContactTabDescription")}
          title={t("supportTickets")}
        >
          <HelpSupportTicketsScreen />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
