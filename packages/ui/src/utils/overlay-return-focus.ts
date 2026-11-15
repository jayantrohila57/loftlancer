import type { RefObject } from "react"
import { useCallback, useRef } from "react"

/** Active element to restore after a controlled overlay closes. */
export function readFocusReturnTarget(): HTMLElement | null {
  const active = document.activeElement
  if (!(active instanceof HTMLElement)) {
    return null
  }
  if (active === document.body || active === document.documentElement) {
    return null
  }
  return active
}

export type OverlayFinalFocus = () => HTMLElement | null | undefined

export interface UseOverlayReturnFocusResult {
  readonly captureReturnFocus: () => void
  readonly fallbackRef: RefObject<HTMLElement | null>
  readonly resolveFinalFocus: OverlayFinalFocus
  readonly returnFocusRef: RefObject<HTMLElement | null>
}

/** Capture focus before opening overlays that are not wired to `*Trigger`. */
export function useOverlayReturnFocus(): UseOverlayReturnFocusResult {
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const fallbackRef = useRef<HTMLElement | null>(null)

  const captureReturnFocus = useCallback(() => {
    returnFocusRef.current = readFocusReturnTarget()
  }, [])

  const resolveFinalFocus = useCallback(() => {
    return returnFocusRef.current ?? fallbackRef.current ?? undefined
  }, [])

  return {
    captureReturnFocus,
    fallbackRef,
    resolveFinalFocus,
    returnFocusRef,
  }
}
