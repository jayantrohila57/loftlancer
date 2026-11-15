import { getAuth } from "@packages/better-auth"
import {
  PROFILE_AVATAR_MAX_BYTES,
  PROFILE_AVATAR_MULTIPART_OVERHEAD,
} from "../utils/constants/profile.constants.avatar"
import { profileRouter } from "./profile.router"

class AvatarBodyTooLargeError extends Error {}

export async function uploadProfileAvatar(request: Request) {
  const origin = request.headers.get("origin")
  if (!origin || origin !== new URL(request.url).origin)
    return Response.json({ error: "Invalid request origin." }, { status: 403 })
  const session = await getAuth().api.getSession({ headers: request.headers })
  if (!session)
    return Response.json({ error: "Sign in first." }, { status: 401 })
  const lengthHeader = request.headers.get("content-length")
  const length = lengthHeader === null ? null : Number(lengthHeader)
  if (
    length !== null &&
    (!/^\d+$/.test(lengthHeader ?? "") ||
      !Number.isSafeInteger(length) ||
      length <= 0 ||
      length > PROFILE_AVATAR_MAX_BYTES + PROFILE_AVATAR_MULTIPART_OVERHEAD)
  )
    return Response.json(
      { error: "Image must be 5 MB or smaller." },
      { status: 413 }
    )
  if (!request.body)
    return Response.json({ error: "Invalid upload." }, { status: 400 })
  let received = 0
  const limit = PROFILE_AVATAR_MAX_BYTES + PROFILE_AVATAR_MULTIPART_OVERHEAD
  const boundedBody = request.body.pipeThrough(
    new TransformStream<Uint8Array, Uint8Array>({
      transform(chunk, controller) {
        received += chunk.byteLength
        if (received > limit) throw new AvatarBodyTooLargeError()
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
    return error instanceof AvatarBodyTooLargeError
      ? Response.json(
          { error: "Image must be 5 MB or smaller." },
          { status: 413 }
        )
      : Response.json({ error: "Invalid upload." }, { status: 400 })
  }
  const file = form.get("file")
  if (!(file instanceof File))
    return Response.json(
      { error: "Choose an image of 5 MB or smaller." },
      { status: 400 }
    )
  const result = await profileRouter.uploadAvatar(file)
  if (result.status === "success") return Response.json(result.data)
  return Response.json(
    { error: result.message },
    { status: result.status === "failed" ? 400 : 503 }
  )
}
