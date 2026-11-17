"use cache"

import { cacheLife, cacheTag } from "next/cache"

export async function getWebCachedMessages(locale: string) {
  cacheTag(`web:i18n-messages:${locale}`)
  cacheLife("max")

  switch (locale) {
    case "en-us": {
      const [base, legal, publicMessages] = await Promise.all([
        import("./messages/web.en-us.json"),
        import("./messages/legal/legal.en-us.json"),
        import("./messages/public/public.en-us.json"),
      ])
      return { ...base.default, ...publicMessages.default, legal: legal.default }
    }
    case "en-in": {
      const [base, legal, publicMessages] = await Promise.all([
        import("./messages/web.en-in.json"),
        import("./messages/legal/legal.en-in.json"),
        import("./messages/public/public.en-in.json"),
      ])
      return { ...base.default, ...publicMessages.default, legal: legal.default }
    }
    case "es-es": {
      const [base, legal, publicMessages] = await Promise.all([
        import("./messages/web.es-es.json"),
        import("./messages/legal/legal.es-es.json"),
        import("./messages/public/public.es-es.json"),
      ])
      return { ...base.default, ...publicMessages.default, legal: legal.default }
    }
    default:
      throw new Error(`Unsupported locale: ${locale}`)
  }
}
