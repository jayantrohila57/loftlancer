"use client"

import type { ShellSectionTabItem } from "@features/shell"
import { ShellSectionSubnav } from "@features/shell"
import { resolveStudioOnboardingSectionTabValue } from "@/shared/shell/studio-onboarding-tab.utils"

export function StudioOnboardingSectionSubnav({
  tabs,
}: {
  readonly tabs: readonly ShellSectionTabItem[]
}) {
  return (
    <ShellSectionSubnav
      resolveTabValue={resolveStudioOnboardingSectionTabValue}
      tabs={tabs}
    />
  )
}
