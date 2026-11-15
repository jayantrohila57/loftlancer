import "@/shared/auth/auth.bootstrap"

import { getAccountSessionsResponse } from "@modules/sessions/server"

export async function GET(request: Request) {
  return getAccountSessionsResponse(request)
}
