type ServiceResponseFailure = {
  readonly status: string
  readonly message: string
  readonly error?: { readonly code?: string }
}

export class InvalidInputClientError extends Error {
  override readonly name = "InvalidInputClientError"

  constructor(message: string) {
    super(message)
  }
}

export function isInvalidInputServiceResponse(
  response: ServiceResponseFailure
): boolean {
  return (
    response.status === "failed" && response.error?.code === "INVALID_INPUT"
  )
}

export function serviceResponseFailureMessage(
  response: ServiceResponseFailure,
  input: { readonly invalid: string; readonly fallback: string }
): string {
  if (isInvalidInputServiceResponse(response)) {
    return response.message.trim() || input.invalid
  }
  return input.fallback
}

export function throwOnServiceResponseFailure(
  response: ServiceResponseFailure
): void {
  if (response.status === "failed") {
    if (isInvalidInputServiceResponse(response)) {
      throw new InvalidInputClientError(
        response.message.trim() || "Invalid request."
      )
    }
    throw new Error(response.message)
  }
  if (response.status === "error") {
    throw new Error(response.message)
  }
}
