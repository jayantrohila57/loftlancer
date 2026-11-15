"use client"

import { useEffect, useState } from "react"

/** Avoid SSR/client mismatch for session-dependent profile UI. */
export function useProfileClientMounted(): boolean {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  return mounted
}
