import { ShellSubHeader } from "@features/shell"
import type { AccountSectionKey } from "@modules/shell"
import { AccountSectionSubnav } from "@modules/shell"
import Shell from "@packages/ui/components/shell"
import type { LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export function AuthAccountSectionLayout({
  action,
  children,
  description,
  icon,
  section,
  title,
}: {
  readonly action?: ReactNode
  readonly children: ReactNode
  readonly description: string
  readonly icon: LucideIcon
  readonly section: AccountSectionKey
  readonly title: string
}) {
  return (
    <Shell.Panel>
      <ShellSubHeader
        action={action}
        description={description}
        icon={icon}
        title={title}
      >
        <AccountSectionSubnav section={section} />
      </ShellSubHeader>
      <Shell.Scroll>{children}</Shell.Scroll>
    </Shell.Panel>
  )
}
