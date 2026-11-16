import type { ShellSectionTabItem, ShellSubHeaderProps } from "@features/shell"
import {
  ShellSectionLayout,
  ShellSectionSubnav,
  ShellSubHeader,
} from "@features/shell"
import type { ReactNode } from "react"
import { Suspense } from "react"

export function StudioOrgSectionLayout({
  action,
  children,
  description,
  icon,
  tabs,
  title,
}: {
  readonly action?: ShellSubHeaderProps["action"]
  readonly children: ReactNode
  readonly description: string
  readonly icon: ShellSubHeaderProps["icon"]
  readonly tabs: readonly ShellSectionTabItem[]
  readonly title: string
}) {
  return (
    <ShellSectionLayout
      header={
        <ShellSubHeader
          action={action}
          description={description}
          icon={icon}
          title={title}
        >
          {tabs.length > 0 ? (
            <Suspense fallback={null}>
              <ShellSectionSubnav tabs={tabs} />
            </Suspense>
          ) : null}
        </ShellSubHeader>
      }
    >
      {children}
    </ShellSectionLayout>
  )
}
