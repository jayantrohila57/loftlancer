import type { ZodError } from "zod";
import type { ServiceFieldErrors } from "../types/utils.service-response.types";

export function toServiceFieldErrors(error: ZodError): ServiceFieldErrors {
  const fields: Record<string, string[]> = {};
  for (const issue of error.issues) {
    const [name] = issue.path;
    if (typeof name !== "string") continue;
    fields[name] ??= [];
    fields[name].push(issue.message);
  }
  return fields;
}
