import type { ServiceResponse } from "@module/shared/utils/types/utils.service-response.types";

/** Read list payload from a module ServiceResponse returned over tRPC/oRPC bridge. */
export function serviceListItems<T>(
  response: ServiceResponse<T> | undefined,
): T[] {
  if (response?.status !== "success" || !Array.isArray(response.data)) {
    return [];
  }
  return response.data;
}

/** Read single-object payload from a module ServiceResponse. */
export function serviceObject<T extends object>(
  response: ServiceResponse<T> | undefined,
): T | undefined {
  if (
    response?.status !== "success" ||
    !response.data ||
    Array.isArray(response.data)
  ) {
    return undefined;
  }
  return response.data;
}

/** Read nested `items` when the unwrapped legacy tRPC shape is used. */
export function legacyListItems<T>(
  response: { items?: T[] } | ServiceResponse<T> | undefined,
): T[] {
  if (response && "items" in response && Array.isArray(response.items)) {
    return response.items;
  }
  return serviceListItems(response as ServiceResponse<T> | undefined);
}

/** Read member/org list rows from ServiceResponse or legacy `{ items }` tRPC unwrap. */
export function serviceNestedItems<T>(
  response: ServiceResponse<{ items: T[] }> | { items: T[] } | undefined,
): T[] {
  if (response && "items" in response && Array.isArray(response.items)) {
    return response.items;
  }
  const obj = serviceObject(response as ServiceResponse<{ items: T[] }>);
  return obj?.items ?? [];
}
