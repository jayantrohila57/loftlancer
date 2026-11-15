type ActivityDetailResponse = {
  readonly status: string
  readonly error?: { readonly code: string }
}

export function isActivityDetailNotFound(
  data: ActivityDetailResponse | null | undefined
): boolean {
  return data?.status === "failed" && data.error?.code === "NOT_FOUND"
}

export function isActivityDetailLoadFailure(
  data: ActivityDetailResponse | null | undefined,
  isError: boolean
): boolean {
  return (
    isError ||
    data?.status === "error" ||
    (data?.status === "failed" && !isActivityDetailNotFound(data))
  )
}
