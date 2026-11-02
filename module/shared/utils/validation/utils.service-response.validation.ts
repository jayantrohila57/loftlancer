import { z } from "zod";

import type {
  ServiceErrorDetail,
  ServiceFieldErrors,
  ServiceResponse,
} from "../types/utils.service-response.types";

const serviceFieldErrorsSchema = z.record(
  z.string(),
  z.union([z.string(), z.array(z.string())]),
);

const serviceErrorDetailSchema: z.ZodType<ServiceErrorDetail> = z.object({
  code: z.string(),
  message: z.string().optional(),
  cause: z.unknown().optional(),
});

export const serviceStatusSchema = z.enum(["success", "failed", "error"]);

export function serviceResponseSchema<T extends z.ZodTypeAny>(dataSchema: T) {
  return z.object({
    status: serviceStatusSchema,
    data: z.union([dataSchema, z.array(dataSchema), z.null()]),
    message: z.string(),
    error: z
      .union([serviceFieldErrorsSchema, serviceErrorDetailSchema, z.null()])
      .optional(),
  });
}

/** Use when validating unknown controller output before return. */
export const serviceResponseUnknownSchema = serviceResponseSchema(z.unknown());

export function createSuccess<T>(
  data: T | T[] | null,
  message: string,
): ServiceResponse<T> {
  return { status: "success", data, message };
}

export function createFailed<T = null>(
  message: string,
  error?: ServiceFieldErrors | null,
): ServiceResponse<T> {
  return {
    status: "failed",
    data: null,
    message,
    ...(error ? { error } : {}),
  };
}

export function createError<T = null>(
  message: string,
  error: ServiceErrorDetail,
): ServiceResponse<T> {
  return { status: "error", data: null, message, error };
}

export function mapOutcomeToResponse<T>(
  outcome: import("../types/utils.service-outcome.types").ServiceOutcome<T>,
): ServiceResponse<T> {
  switch (outcome.kind) {
    case "success":
      return createSuccess(outcome.data, outcome.message ?? "OK");
    case "failed":
      return createFailed(outcome.message, outcome.fieldErrors ?? null);
    case "error":
      return createError(outcome.message, outcome.detail);
    default: {
      const _exhaustive: never = outcome;
      return _exhaustive;
    }
  }
}
