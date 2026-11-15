import Shell from "@packages/ui/components/shell"
import type { ReactNode } from "react"

export interface ShellSectionLayoutProps {
  readonly header: ReactNode
  readonly children: ReactNode
}

/** Fixed section chrome (e.g. `ShellSubHeader`) + scrollable page body under `Shell.Main`. */
export function ShellSectionLayout({
  header,
  children,
}: ShellSectionLayoutProps) {
  return (
    <Shell.Panel>
      {header}
      <Shell.Scroll>{children}</Shell.Scroll>
    </Shell.Panel>
  )
}
