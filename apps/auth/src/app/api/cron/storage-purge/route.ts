import { storageService } from "@modules/storage/server"

function authorizeCron(request: Request) {
  const secret = process.env.CRON_SECRET
  if (!secret) return process.env.NODE_ENV === "development"
  const header = request.headers.get("authorization")
  return header === `Bearer ${secret}`
}

export async function GET(request: Request) {
  if (!authorizeCron(request)) {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }
  const result = await storageService.purgeExpiredTrash({ limit: 100 })
  return Response.json(result)
}
