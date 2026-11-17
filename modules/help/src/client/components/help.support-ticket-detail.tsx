import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import { getTranslations } from "next-intl/server"

import { HelpSupportTicketDetailScreen } from "./help.support-ticket-detail.client"

export async function HelpSupportTicketDetailPage({
  ticketId,
}: {
  readonly ticketId: string
}) {
  const t = await getTranslations("ui")

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("helpSupportTicketDetailDescription")}
          title={t("supportTickets")}
        >
          <HelpSupportTicketDetailScreen ticketId={ticketId} />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
