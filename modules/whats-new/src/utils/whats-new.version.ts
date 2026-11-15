import { LAST_SEEN_VERSION_STORAGE_KEY } from "./constants/whats-new.constants"

const listeners = new Set<() => void>()

function canUseStorage(): boolean {
  return (
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
  )
}

function notify(): void {
  for (const listener of listeners) {
    listener()
  }
}

export function subscribeLastSeenVersion(
  onStoreChange: () => void
): () => void {
  listeners.add(onStoreChange)
  if (!canUseStorage()) {
    return () => {
      listeners.delete(onStoreChange)
    }
  }
  const onStorage = (event: StorageEvent) => {
    if (event.key === LAST_SEEN_VERSION_STORAGE_KEY || event.key === null) {
      onStoreChange()
    }
  }
  window.addEventListener("storage", onStorage)
  return () => {
    listeners.delete(onStoreChange)
    window.removeEventListener("storage", onStorage)
  }
}

/** Build-time app version from `NEXT_PUBLIC_APP_VERSION`. */
export function getCurrentVersion(): string {
  return process.env.NEXT_PUBLIC_APP_VERSION?.trim() ?? ""
}

/** Last acknowledged version, or `null` on the server / if none is stored. */
export function getLastSeenVersion(): string | null {
  if (!canUseStorage()) {
    return null
  }
  try {
    const value = window.localStorage.getItem(LAST_SEEN_VERSION_STORAGE_KEY)
    return value?.trim() ? value.trim() : null
  } catch {
    return null
  }
}

/** Persist the current (or provided) version as seen. No-op on the server. */
export function markVersionSeen(version = getCurrentVersion()): void {
  if (!canUseStorage() || !version) {
    return
  }
  try {
    window.localStorage.setItem(LAST_SEEN_VERSION_STORAGE_KEY, version)
    notify()
  } catch {
    // Ignore quota / privacy mode failures.
  }
}

function parseVersion(version: string): [number, number, number] | null {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version)
  if (!match) {
    return null
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])]
}

/**
 * Whether the current app version is newer than the last one the visitor
 * acknowledged. Always `false` during SSR, when storage is unavailable, or
 * when the current version is missing.
 */
export function hasUnseenRelease(): boolean {
  if (!canUseStorage()) {
    return false
  }
  const current = parseVersion(getCurrentVersion())
  if (!current) {
    return false
  }
  const lastSeen = getLastSeenVersion()
  if (!lastSeen) {
    return true
  }
  const previous = parseVersion(lastSeen)
  if (!previous) {
    return true
  }
  for (let index = 0; index < 3; index += 1) {
    const currentPart = current[index]
    const previousPart = previous[index]
    if (currentPart === undefined || previousPart === undefined) {
      return false
    }
    if (currentPart !== previousPart) {
      return currentPart > previousPart
    }
  }
  return false
}
