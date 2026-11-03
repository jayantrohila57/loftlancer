"use client";

import { useSyncExternalStore } from "react";

function subscribe() {
  return () => {};
}

/**
 * `false` on the server and during the hydration pass, `true` afterwards (and
 * immediately on client-side navigations). Use it to render values that
 * depend on the browser (local timezone, `Date.now()`) without a hydration
 * mismatch: render a deterministic placeholder until it flips.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
