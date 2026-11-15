"use client"

import { clientEnv } from "@packages/t3-env/client"

/** Best-effort capture, without prompting. The API enforces the account preference. */
export async function capturePermittedLocation() {
  const controller = new AbortController()
  const timeout = window.setTimeout(() => controller.abort(), 2500)
  try {
    await Promise.race([
      captureLocation(controller.signal),
      new Promise<void>((resolve) =>
        controller.signal.addEventListener("abort", () => resolve(), {
          once: true,
        })
      ),
    ])
  } finally {
    window.clearTimeout(timeout)
  }
}

async function captureLocation(signal: AbortSignal) {
  try {
    const base = new URL(clientEnv.NEXT_PUBLIC_AUTH_APP_URL)
    if (
      base.origin !== window.location.origin ||
      !navigator.geolocation ||
      !navigator.permissions
    )
      return
    const permission = await navigator.permissions.query({
      name: "geolocation",
    })
    if (signal.aborted || permission.state !== "granted") return
    const url = `${base.pathname.replace(/\/$/, "")}/api/account/location`
    const response = await fetch(url, {
      signal,
      cache: "no-store",
    })
    if (!response.ok) return
    const state = await response.json()
    if (
      !state.decided ||
      !state.enabled ||
      !Number.isSafeInteger(state.generation) ||
      signal.aborted
    )
      return
    const position = await new Promise<GeolocationPosition>((resolve, reject) =>
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        timeout: 1500,
        maximumAge: 60000,
      })
    )
    if (signal.aborted) return
    const { latitude, longitude, accuracy } = position.coords
    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        latitude,
        longitude,
        accuracyMeters: accuracy,
        generation: state.generation,
      }),
      signal,
    })
  } catch {
    /* Location must not block sign-in, sign-out, or session review. */
  }
}
