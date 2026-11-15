import { readSocialProviderAvailability } from "@packages/better-auth"
import { connection } from "next/server"

export async function GET() {
  await connection()
  return Response.json(readSocialProviderAvailability(), {
    headers: { "Cache-Control": "no-store" },
  })
}
