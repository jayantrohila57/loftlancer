const BINARY_PREFIXES = ["B", "KB", "MB", "GB", "TB"] as const

/** Human-readable byte size for storage UI (binary prefixes). */
export function formatStorageBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B"
  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    BINARY_PREFIXES.length - 1
  )
  const value = bytes / 1024 ** exponent
  const formatted =
    value >= 10 || exponent === 0 ? value.toFixed(0) : value.toFixed(1)
  return `${formatted} ${BINARY_PREFIXES[exponent]}`
}
