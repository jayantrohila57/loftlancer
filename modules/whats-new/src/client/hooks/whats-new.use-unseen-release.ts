"use client"

import { useSyncExternalStore } from "react"

import {
  hasUnseenRelease,
  subscribeLastSeenVersion,
} from "../../utils/whats-new.version"

/** SSR-safe: the server snapshot is always `false`. */
export function useHasUnseenRelease(): boolean {
  return useSyncExternalStore(
    subscribeLastSeenVersion,
    hasUnseenRelease,
    () => false
  )
}
