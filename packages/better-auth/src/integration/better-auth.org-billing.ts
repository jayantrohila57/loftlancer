import { serverEnv } from "@packages/t3-env/server"
import { autumn } from "autumn-js/better-auth"
import { organization } from "better-auth/plugins/organization"

import { getConfiguredOrganizationPluginOptions } from "./better-auth.configure"

/** Better Auth organization + Autumn plugins (org must precede autumn). */
export function buildOrganizationPlugin() {
  return organization({
    ...(getConfiguredOrganizationPluginOptions() ?? {}),
  })
}

export function buildAutumnPlugin() {
  return autumn({
    customerScope: "organization",
    secretKey: serverEnv.AUTUMN_SECRET_KEY,
    baseURL: serverEnv.AUTUMN_API_BASE_URL,
  })
}
