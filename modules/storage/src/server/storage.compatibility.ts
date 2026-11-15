import { readActiveOrganizationId } from "@modules/org/utils/org.session"
import { getAuth } from "@packages/better-auth"
import { getDb } from "@packages/drizzle"
import { member } from "@packages/drizzle/schema"
import { and, eq } from "drizzle-orm"

import {
  ORG_STORAGE_MAX_FILE_BYTES,
  ORG_STORAGE_MULTIPART_OVERHEAD_BYTES,
} from "../utils/constants/storage.constants.limits"
import { completeStorageUploadService } from "./services/storage.service.complete-upload"

class StorageBodyTooLargeError extends Error {}

export async function uploadOrgStorageFile(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin || origin !== new URL(request.url).origin) {
    return Response.json({ error: "Invalid request origin." }, { status: 403 })
  }
  const session = await getAuth().api.getSession({ headers: request.headers })
  if (!session) {
    return Response.json({ error: "Sign in first." }, { status: 401 })
  }

  const organizationId = readActiveOrganizationId(
    session as Parameters<typeof readActiveOrganizationId>[0]
  )
  if (!organizationId) {
    return Response.json(
      { error: "Select an organization first." },
      { status: 403 }
    )
  }

  const db = getDb()
  if (!db) {
    return Response.json({ error: "Database unavailable." }, { status: 503 })
  }

  const [membership] = await db
    .select({ role: member.role })
    .from(member)
    .where(
      and(
        eq(member.organizationId, organizationId),
        eq(member.userId, session.user.id)
      )
    )
    .limit(1)
  if (!membership) {
    return Response.json(
      { error: "Not a member of this organization." },
      {
        status: 403,
      }
    )
  }

  const lengthHeader = request.headers.get("content-length")
  const length = lengthHeader === null ? null : Number(lengthHeader)
  const limit =
    ORG_STORAGE_MAX_FILE_BYTES + ORG_STORAGE_MULTIPART_OVERHEAD_BYTES
  if (
    length !== null &&
    (!/^\d+$/.test(lengthHeader ?? "") ||
      !Number.isSafeInteger(length) ||
      length <= 0 ||
      length > limit)
  ) {
    return Response.json(
      { error: "File must be 4 MB or smaller." },
      { status: 413 }
    )
  }

  if (!request.body) {
    return Response.json({ error: "Invalid upload." }, { status: 400 })
  }

  let received = 0
  const boundedBody = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength
        if (received > limit) throw new StorageBodyTooLargeError()
        controller.enqueue(chunk)
      },
    })
  )

  let form: FormData
  try {
    form = await new Response(boundedBody, {
      headers: { "content-type": request.headers.get("content-type") ?? "" },
    }).formData()
  } catch (error) {
    return error instanceof StorageBodyTooLargeError
      ? Response.json(
          { error: "File must be 4 MB or smaller." },
          { status: 413 }
        )
      : Response.json({ error: "Invalid upload." }, { status: 400 })
  }

  const file = form.get("file")
  const itemId = form.get("itemId")
  if (!(file instanceof File) || typeof itemId !== "string" || !itemId) {
    return Response.json({ error: "Choose a file to upload." }, { status: 400 })
  }

  const result = await completeStorageUploadService({
    organizationId,
    userId: session.user.id,
    itemId,
    file,
  })
  if (result.status === "success") return Response.json(result.data)
  const status =
    result.error?.code === "UPLOAD_FAILED" ||
    result.error?.code === "STORAGE_UNAVAILABLE"
      ? 503
      : 400
  return Response.json(
    { error: result.message, code: result.error?.code },
    { status }
  )
}
