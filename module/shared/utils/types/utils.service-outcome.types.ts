import type {
  ServiceErrorDetail,
  ServiceFieldErrors,
} from "./utils.service-response.types";

export type ServiceOutcomeSuccess<T> = {
  kind: "success";
  data: T | T[] | null;
  message?: string;
};

export type ServiceOutcomeFailed = {
  kind: "failed";
  message: string;
  fieldErrors?: ServiceFieldErrors;
};

export type ServiceOutcomeError = {
  kind: "error";
  message: string;
  detail: ServiceErrorDetail;
};

export type ServiceOutcome<T> =
  | ServiceOutcomeSuccess<T>
  | ServiceOutcomeFailed
  | ServiceOutcomeError;

export function outcomeToMessage(outcome: ServiceOutcome<unknown>): string {
  if (outcome.kind === "success") {
    return outcome.message ?? "OK";
  }
  return outcome.message;
}
