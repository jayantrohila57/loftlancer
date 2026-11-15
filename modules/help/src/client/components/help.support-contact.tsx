import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import { serverEnv } from "@packages/t3-env/server"
import Shell from "@packages/ui/components/shell"
import { getTranslations } from "next-intl/server"

import { HelpSupportContactScreen } from "./help.support-contact.client"

export async function HelpSupportContactPage() {
  const t = await getTranslations("ui")
  const supportEmail = serverEnv.SUPPORT_EMAIL ?? ""

  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          description={t("helpSupportContactTabDescription")}
          title={t("supportTickets")}
        >
          <HelpSupportContactScreen supportEmail={supportEmail} />
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
