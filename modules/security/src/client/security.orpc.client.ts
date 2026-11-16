"use client"

import { createORPCClient, RPCLink } from "@packages/orpc"
import type { RouterClient } from "@packages/orpc/server"
import { clientEnv } from "@packages/t3-env/client"
import type { securityRouter } from "../server/security.router"

type SecurityClient = RouterClient<{ security: typeof securityRouter }>

function billingRpcUrl() {
  const auth = new URL(clientEnv.NEXT_PUBLIC_AUTH_APP_URL)
  const path = auth.pathname.replace(/\/$/, "")
  return `${auth.origin}${path}/api/rpc`
}

const link = new RPCLink({
  url: () => billingRpcUrl(),
  fetch: (input, init) =>
    fetch(input, {
      ...init,
      credentials: "include",
    }),
})

export const securityRpc: SecurityClient = createORPCClient(link)
