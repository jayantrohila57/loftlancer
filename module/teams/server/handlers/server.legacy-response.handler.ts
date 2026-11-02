import type { ServiceResponse } from "@module/shared/utils/types/utils.service-response.types";
/** Temporary adapter for existing tRPC/MCP consumers; native oRPC retains ServiceResponse. */
export function unwrapTeamObject<T>(response: ServiceResponse<T>): T {
  if (
    response.status !== "success" ||
    !response.data ||
    Array.isArray(response.data)
  )
    throw new Error(response.message);
  return response.data;
}
export function unwrapTeamList<T>(response: ServiceResponse<T>): {
  items: T[];
} {
  if (response.status !== "success" || !Array.isArray(response.data))
    throw new Error(response.message);
  return { items: response.data };
}
