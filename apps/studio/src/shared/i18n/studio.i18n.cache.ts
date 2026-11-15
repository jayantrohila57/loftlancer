"use cache"

import { cacheLife, cacheTag } from "next/cache"

export async function getStudioCachedMessages(locale: string) {
  cacheTag(`studio:i18n-messages:${locale}`)
  cacheLife("max")

  switch (locale) {
    case "en-us":
      return (await import("./messages/studio.en-us.json")).default
    case "en-in":
      return (await import("./messages/studio.en-in.json")).default
    case "es-es":
      return (await import("./messages/studio.es-es.json")).default
    default:
      throw new Error(`Unsupported locale: ${locale}`)
  }
}
