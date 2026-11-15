import { ShellAccountFrame, ShellAccountFrameSection } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import type { ReactNode } from "react"

export function PrivacyAccountFrame({
  activityTarget,
  children,
  description,
  title,
}: {
  readonly activityTarget: string
  readonly children: ReactNode
  readonly description: string
  readonly title: string
}) {
  return (
    <Shell.Section variant="dashboard">
      <ShellAccountFrame>
        <ShellAccountFrameSection
          activityTarget={activityTarget}
          description={description}
          title={title}
        >
          {children}
        </ShellAccountFrameSection>
      </ShellAccountFrame>
    </Shell.Section>
  )
}
