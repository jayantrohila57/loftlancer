import type {
  ServiceFieldErrors,
  ServiceResponse,
} from "../utils/types/utils.service-response.types";

export type ToastAdapter = {
  success: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
};

export type ApplyResponseToastOptions = {
  skipToast?: boolean;
};

function fieldErrorSummary(
  error: ServiceFieldErrors | undefined,
): string | null {
  if (!error) return null;
  const first = Object.values(error)[0];
  if (first == null) return null;
  if (Array.isArray(first)) return first[0] ?? null;
  return first;
}

/**
 * Maps ServiceResponse to toast variant. Inject app's toast (e.g. sonner) from the hook.
 */
export function applyResponseToast(
  response: ServiceResponse<unknown>,
  toast: ToastAdapter,
  options?: ApplyResponseToastOptions,
): void {
  if (options?.skipToast) return;

  switch (response.status) {
    case "success":
      toast.success(response.message);
      break;
    case "failed": {
      const detail =
        response.error &&
        typeof response.error === "object" &&
        "code" in response.error
          ? null
          : fieldErrorSummary(response.error as ServiceFieldErrors | undefined);
      toast.warning(
        detail ? `${response.message} ${detail}` : response.message,
      );
      break;
    }
    case "error":
      toast.error(response.message);
      break;
    default:
      break;
  }
}
