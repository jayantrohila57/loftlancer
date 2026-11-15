"use client"

import { useEffect, useState } from "react"

export function useBrowserLocationPermission():
  | PermissionState
  | "unavailable" {
  const [permission, setPermission] = useState<PermissionState | "unavailable">(
    "unavailable"
  )

  useEffect(() => {
    let active = true
    let status: PermissionStatus | undefined
    const update = () => {
      if (active && status) setPermission(status.state)
    }
    async function observe() {
      try {
        if (!navigator.permissions) return
        const result = await navigator.permissions.query({
          name: "geolocation",
        })
        if (!active) return
        status = result
        update()
        status.addEventListener("change", update)
      } catch {
        if (active) setPermission("unavailable")
      }
    }
    observe().catch(() => {
      if (active) setPermission("unavailable")
    })
    return () => {
      active = false
      status?.removeEventListener("change", update)
    }
  }, [])

  return permission
}
