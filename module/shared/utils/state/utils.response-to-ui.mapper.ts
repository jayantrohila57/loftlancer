import type { ServiceResponse } from "../types/utils.service-response.types";

export type ResponseUiPhase =
  | "loading"
  | "empty"
  | "content"
  | "failed"
  | "error";

export type ResponseUiState = {
  phase: ResponseUiPhase;
  response: ServiceResponse<unknown> | null;
  isPending: boolean;
};

/**
 * Derives boundary UI phase from hook pending state and ServiceResponse.
 * Loading is never a ServiceResponse status.
 */
export function responseToUiState(input: {
  response: ServiceResponse<unknown> | null | undefined;
  isPending: boolean;
}): ResponseUiState {
  const { response, isPending } = input;
  if (isPending || response == null) {
    return { phase: "loading", response: response ?? null, isPending: true };
  }

  if (response.status === "failed") {
    return { phase: "failed", response, isPending: false };
  }
  if (response.status === "error") {
    return { phase: "error", response, isPending: false };
  }

  const data = response.data;
  const isEmpty = data === null || (Array.isArray(data) && data.length === 0);

  if (isEmpty) {
    return { phase: "empty", response, isPending: false };
  }

  return { phase: "content", response, isPending: false };
}
