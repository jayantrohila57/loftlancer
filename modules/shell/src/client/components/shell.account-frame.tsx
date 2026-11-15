import {
  Frame,
  FrameDescription,
  FrameHeader,
  FramePanel,
  FrameTitle,
} from "@packages/ui/components/frame"
import Shell from "@packages/ui/components/shell"
import type { ReactNode } from "react"

export function ShellAccountFrame({
  children,
}: {
  readonly children: ReactNode
}) {
  return (
    <Shell.Section className="gap-2" variant="dashboard">
      {children}
    </Shell.Section>
  )
}

export function ShellAccountFrameSection({
  children,
  title,
  description,
  activityTarget,
}: {
  readonly children: ReactNode
  readonly title: string
  readonly description: string
  readonly activityTarget?: string
}) {
  return (
    <Frame data-activity-target={activityTarget}>
      <FrameHeader>
        <FrameTitle>{title}</FrameTitle>
        <FrameDescription>{description}</FrameDescription>
      </FrameHeader>
      <FramePanel>{children}</FramePanel>
    </Frame>
  )
}
