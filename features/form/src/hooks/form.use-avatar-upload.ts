"use client"

import { useState } from "react"

/** Executes a caller-provided upload without coupling the form feature to storage. */
export function useAvatarUpload(upload: (file: File) => Promise<string>) {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function uploadFile(file: File) {
    setPending(true)
    setError(null)
    try {
      if (
        !["image/png", "image/jpeg", "image/webp", "image/gif"].includes(
          file.type
        )
      ) {
        throw new Error("Choose a PNG, JPEG, WebP, or GIF image.")
      }
      if (file.size > 5 * 1024 * 1024) {
        throw new Error("Choose an image smaller than 5 MB.")
      }
      return await upload(file)
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : "Could not upload image."
      )
      return null
    } finally {
      setPending(false)
    }
  }
  return { uploadFile, pending, error }
}
