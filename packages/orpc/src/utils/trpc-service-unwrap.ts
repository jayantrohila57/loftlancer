import { TRPCError } from "@trpc/server";

/** Structural match for module ServiceResponse (avoid packages → module import). */
type ServiceResponse<T> = {
  status: "success" | "failed" | "error";
  data: T | T[] | null;
  message: string;
  error?: unknown;
};

/** Unwrap module ServiceResponse for legacy tRPC consumers (Studio). */
export async function unwrapServiceResponse<T>(
  result: ServiceResponse<T> | Promise<ServiceResponse<T>>,
): Promise<T> {
  const response = await result;
  if (response.status === "success" && response.data !== null) {
    return response.data as T;
  }
  throw new TRPCError({
    code: response.status === "error" ? "INTERNAL_SERVER_ERROR" : "BAD_REQUEST",
    message: response.message,
  });
}
