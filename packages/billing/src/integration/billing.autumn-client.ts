import { serverEnv } from "@packages/t3-env/server"
import { Autumn } from "autumn-js"

let autumnClient: Autumn | null = null

/** Shared Autumn SDK client (self-hosted base URL + secret). */
export function getAutumnClient(): Autumn | null {
  if (!serverEnv.AUTUMN_SECRET_KEY) return null
  if (!autumnClient) {
    autumnClient = new Autumn({
      secretKey: serverEnv.AUTUMN_SECRET_KEY,
      serverURL: serverEnv.AUTUMN_API_BASE_URL,
      // Self-hosted OSS may lag cloud; pin below autumn-js default (2.6.0).
      xApiVersion: serverEnv.AUTUMN_X_API_VERSION ?? "2.3.0",
    })
  }
  return autumnClient
}

export function isAutumnConfigured() {
  return Boolean(serverEnv.AUTUMN_SECRET_KEY)
}
