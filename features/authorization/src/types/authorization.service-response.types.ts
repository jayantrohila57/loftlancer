export type ServiceStatus = "success" | "failed" | "error";

/** Field-level validation errors for `status: "failed"`. */
export type ServiceFieldErrors = Record<string, string | string[]>;

/** Structured system error for `status: "error"`. */
export type ServiceErrorDetail = {
  code: string;
  message?: string;
  cause?: unknown;
};

export type ServiceResponse<T> = {
  status: ServiceStatus;
  data: T | T[] | null;
  message: string;
  error?: ServiceFieldErrors | ServiceErrorDetail | null;
};
