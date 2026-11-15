import Shell from "@packages/ui/components/shell"
import type { ReactNode } from "react"

interface AuthPortalLayoutProps {
  readonly children: ReactNode
}

export default function AuthPortalLayout({ children }: AuthPortalLayoutProps) {
  return (
    <Shell>
      <Shell.Frame>
        <Shell.Main variant="dashboard">{children}</Shell.Main>
      </Shell.Frame>
    </Shell>
  )
}
