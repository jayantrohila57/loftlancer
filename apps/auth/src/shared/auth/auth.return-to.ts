export function pickReturnTo(
  returnTo: string | string[] | undefined
): string | undefined {
  return typeof returnTo === "string" ? returnTo : undefined
}

export function buildReturnToQuery(
  returnTo: string | string[] | undefined
): string {
  const value = pickReturnTo(returnTo)
  return value ? `?${new URLSearchParams({ returnTo: value })}` : ""
}
