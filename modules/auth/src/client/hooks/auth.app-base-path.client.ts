"use client"

import { clientEnv } from "@packages/t3-env/client"

export function getAuthAppBasePath(): string {
  return new URL(clientEnv.NEXT_PUBLIC_AUTH_APP_URL).pathname.replace(/\/$/, "")
}
