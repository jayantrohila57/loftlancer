import { getDbHealthResponse } from "@modules/health"
import { NextResponse } from "next/server"

export async function GET() {
  const { body, status } = await getDbHealthResponse()

  return NextResponse.json(body, { status })
}
