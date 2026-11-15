import { ORPCError } from "@packages/orpc/server"
import { saveLocationInputSchema } from "../../utils/validation/location.location.save.schema"
import { saveLocationController } from "../services/location.service.location.save"
export async function saveAccountLocationResponse(
  userId: string,
  sessionId: string,
  input: unknown
) {
  const value = saveLocationInputSchema.safeParse(input)
  if (!value.success)
    return Response.json(
      { error: "Invalid location or missing generation. Refresh and retry." },
      { status: 400 }
    )
  try {
    return Response.json(
      await saveLocationController(userId, sessionId, value.data)
    )
  } catch (error) {
    if (error instanceof ORPCError && error.code === "CONFLICT")
      return Response.json({ error: error.message }, { status: 409 })
    if (error instanceof ORPCError && error.code === "FORBIDDEN")
      return Response.json({ error: error.message }, { status: 403 })
    throw error
  }
}
