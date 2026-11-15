import { z } from "zod"

const storageActivityCursorSchema = z.object({
  id: z.string().min(1),
  time: z.string().datetime(),
})

export type StorageActivityCursor = z.infer<typeof storageActivityCursorSchema>

export function encodeStorageActivityCursor(input: StorageActivityCursor) {
  return Buffer.from(JSON.stringify(input), "utf8").toString("base64url")
}

export function decodeStorageActivityCursor(
  cursor: string | undefined
): StorageActivityCursor | null {
  if (!cursor) return null
  try {
    return storageActivityCursorSchema.parse(
      JSON.parse(Buffer.from(cursor, "base64url").toString("utf8"))
    )
  } catch {
    return null
  }
}
