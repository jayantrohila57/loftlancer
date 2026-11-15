import "@/shared/auth/auth.bootstrap"

import { createAuthRouteHandlers } from "@packages/better-auth"
import { githubStateErrorResponse } from "@/shared/auth/auth.github-callback"

const handlers = createAuthRouteHandlers()
export const { POST, OPTIONS } = handlers
export async function GET(request: Request) {
  return githubStateErrorResponse(request, await handlers.GET(request))
}
