"use client"

import { createORPCClient, RPCLink } from "@packages/orpc"
import type { RouterClient } from "@packages/orpc/server"
import { clientEnv } from "@packages/t3-env/client"
import type { securityRouter } from "../server/security.router"

type SecurityClient = RouterClient<{ security: typeof securityRouter }>

const base = new URL(clientEnv.NEXT_PUBLIC_AUTH_APP_URL).pathname.replace(
  /\/$/,
  ""
)
const link = new RPCLink({
  url: () => `${window.location.origin}${base}/api/rpc`,
})

export const securityRpc: SecurityClient = createORPCClient(link)
