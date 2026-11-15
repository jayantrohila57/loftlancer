import Shell from "@packages/ui/components/shell"
import type { ReactNode } from "react"

/** Account page body. Section headers stay in the route layout. */
export function AccountPageSection({
  children,
}: {
  readonly children?: ReactNode
}) {
  return <Shell.Section variant="dashboard">{children}</Shell.Section>
}
