export function readCheckEmailAddress(
  value: string | null | undefined
): string | undefined {
  const trimmed = value?.trim()
  if (!trimmed || trimmed.length > 320) {
    return undefined
  }
  if (!trimmed.includes("@") || trimmed.includes(" ")) {
    return undefined
  }
  return trimmed
}
