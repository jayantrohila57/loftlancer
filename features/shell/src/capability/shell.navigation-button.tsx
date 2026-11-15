"use client"

import { Button } from "@packages/ui/components/button"
import { useShellNavigation } from "./shell.navigation-context"

export function ShellNavigationButton({
  href,
  label,
}: {
  readonly href: string
  readonly label: string
}) {
  const { Link } = useShellNavigation()
  return (
    <Button render={<Link href={href} />} size="sm">
      {label}
    </Button>
  )
}
