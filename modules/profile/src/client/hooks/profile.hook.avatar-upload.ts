"use client"

import { useMutation } from "@packages/react-query"
import { clientEnv } from "@packages/t3-env/client"
import { z } from "zod"
import { avatarUploadDataSchema } from "../../utils/validation/profile.validation.avatar"

const errorSchema = z.object({ error: z.string() })
export function useUploadAvatar() {
  return useMutation({
    mutationFn: async (file: File) => {
      const body = new FormData()
      body.set("file", file)
      const base = new URL(clientEnv.NEXT_PUBLIC_AUTH_APP_URL).pathname.replace(
        /\/$/,
        ""
      )
      const response = await fetch(`${base}/api/profile/avatar`, {
        method: "POST",
        body,
      })
      let result: unknown
      try {
        result = await response.json()
      } catch {
        result = null
      }
      const parsed = avatarUploadDataSchema.safeParse(result)
      if (!response.ok || !parsed.success) {
        const error = errorSchema.safeParse(result)
        throw new Error(
          error.success ? error.data.error : "Image upload failed."
        )
      }
      return parsed.data.url
    },
  })
}
