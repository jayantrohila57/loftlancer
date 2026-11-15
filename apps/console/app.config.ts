/** Must match `basePath` in `next.config.ts` when set. Proxy matcher paths are relative to basePath. */
export function readNextBasePath(): string {
  const raw = process.env.NEXT_BASE_PATH?.trim()
  if (!raw) {
    return ""
  }
  const normalized = raw.startsWith("/") ? raw : `/${raw}`
  return normalized.replace(/\/$/, "") || ""
}

export const consoleBasePath = readNextBasePath()
