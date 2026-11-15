import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import type { ReactNode } from "react"

export function RegionalPreferencesFrame({
  children,
  description,
  title,
}: {
  readonly children: ReactNode
  readonly description: string
  readonly title: string
}) {
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget="account.regional"
          description={description}
          title={title}
        >
          {children}
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
