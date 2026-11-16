"use client"

import { ShellCommandMenuTrigger } from "@features/shell"
import { useEffect, useState } from "react"

export function WebSiteHeaderCommandTrigger() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <ShellCommandMenuTrigger />
}
