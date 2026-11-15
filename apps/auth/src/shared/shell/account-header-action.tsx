import { Button } from "@packages/ui/components/button"
import type { ReactNode } from "react"
import { Link } from "@/shared/i18n/auth.i18n"

export function AccountHeaderAction({
  href,
  icon,
  label,
}: {
  readonly href: string
  readonly icon?: ReactNode
  readonly label: string
}) {
  return (
    <Button render={<Link href={href} />} size="sm">
      {icon}
      {label}
    </Button>
  )
}
