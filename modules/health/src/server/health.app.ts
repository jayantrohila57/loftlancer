import { healthRouter } from "./health.router"

export type AppHealthResponseBody = {
  readonly ok: boolean
  readonly service: string
  readonly checks: {
    readonly database?: { readonly ok: boolean; readonly error?: string }
  }
}

type AppHealthOptions = {
  readonly checkDatabase: boolean
}

export async function getAppHealthResponseBody(
  service: string,
  options: AppHealthOptions
): Promise<{
  readonly body: AppHealthResponseBody
  readonly status: 200 | 503
}> {
  let ok = true
  let database: AppHealthResponseBody["checks"]["database"]

  if (options.checkDatabase) {
    const db = await healthRouter.database()
    if (db.status === "success") {
      database = { ok: true }
    } else {
      const details = db.error?.details
      database = {
        ok: false,
        error: typeof details === "string" ? details : db.message,
      }
      ok = false
    }
  }

  const checks = database ? { database } : {}
  const body: AppHealthResponseBody = { ok, service, checks }
  return { body, status: ok ? 200 : 503 }
}
