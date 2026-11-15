import type { useFormatter } from "next-intl"

import { formatStorageBytes } from "./storage.format-bytes"

/** Prefer locale-aware byte formatting when `useFormatter` is available. */
export function formatStorageBytesForAccount(
  bytes: number,
  format: ReturnType<typeof useFormatter>
): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return formatStorageBytes(bytes)
  try {
    return format.number(bytes, {
      style: "unit",
      unit: "byte",
      unitDisplay: "short",
      notation: bytes >= 10_000 ? "compact" : "standard",
    })
  } catch {
    return formatStorageBytes(bytes)
  }
}
