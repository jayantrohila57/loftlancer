import {
  getCompatibilitySession,
  unauthorized,
} from "@modules/security/server/shared/security.compatibility"
import { z } from "zod"
import { ACTIVITY_MAX_PAGE } from "../../utils/constants/activity.constants.activity"
import { listActivityQuerySchema } from "../../utils/validation/activity.activity.list.schema"
import { listActivityController } from "../services/activity.service.activity.list"

const querySchema = listActivityQuerySchema.extend({
  page: z.coerce.number().int().min(0).max(ACTIVITY_MAX_PAGE).default(0),
})
export async function getAccountActivityResponse(request: Request) {
  const auth = await getCompatibilitySession(request)
  if (!auth) return unauthorized()
  const parsed = querySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  )
  if (!parsed.success)
    return Response.json({ error: "Invalid query." }, { status: 400 })
  const result = await listActivityController(auth.user.id, parsed.data)
  // Preserve the compatibility endpoint's original row shapes.
  const items = result.items.map((item) => {
    if (parsed.data.kind === "user") {
      const { ipAddress: _ipAddress, userAgent: _userAgent, ...rest } = item
      return rest
    }
    const { resourceType: _resourceType, source: _source, ...rest } = item
    return rest
  })
  return Response.json(
    { ...result, items },
    { headers: { "Cache-Control": "no-store" } }
  )
}
