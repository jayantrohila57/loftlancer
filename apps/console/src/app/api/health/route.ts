import { getAppHealthResponseBody } from "@modules/health"
import { NextResponse } from "next/server"

import { serverEnv } from "@/shared/config/console.server-env"

export async function GET() {
  const { body, status } = await getAppHealthResponseBody("console", {
    checkDatabase: Boolean(serverEnv.DATABASE_URL),
  })
  return NextResponse.json(body, { status })
}
