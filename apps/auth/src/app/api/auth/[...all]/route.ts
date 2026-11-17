import "@/shared/auth/auth.bootstrap"

import { createAuthRouteHandlers } from "@packages/better-auth"
import { oauthStateErrorResponse } from "@/shared/auth/auth.oauth-callback"

const handlers = createAuthRouteHandlers()
export const { POST, OPTIONS } = handlers
export async function GET(request: Request) {
  return oauthStateErrorResponse(request, await handlers.GET(request))
}
