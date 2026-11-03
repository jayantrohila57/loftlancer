"use client";
import type { ActionName } from "@features/authorization/utils";
import { toastManager } from "@loftlancer/ui/toast";
import { applyResponseToast } from "@module/shared/client/apply-response-toast";
import { useModuleOrganizationId } from "@module/shared/client/client.scope.provider";
import { trackActionIntent } from "@module/shared/client/track-action-intent";
import type { ServiceResponse } from "@module/shared/utils/types/utils.service-response.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { teamsQueryKeys } from "../../../utils/constants/utils.query-keys.constants";
export function useTeamsOperationQuery<T>(
  operation: string,
  input: unknown,
  call: () => Promise<ServiceResponse<T>>,
  enabled = true,
  initialData?: ServiceResponse<T>,
) {
  const activeOrganizationId = useModuleOrganizationId();
  const query = useQuery({
    queryKey: teamsQueryKeys.operation(activeOrganizationId, operation, input),
    queryFn: call,
    initialData,
    staleTime: initialData ? 30_000 : 0,
    enabled: Boolean(activeOrganizationId) && enabled,
    meta: { toastOnError: false },
  });
  return {
    ...query,
    response: query.data,
    data:
      query.data?.status === "success" && !Array.isArray(query.data.data)
        ? query.data.data
        : undefined,
  };
}
export function useTeamsRowsQuery<T>(
  operation: string,
  input: unknown,
  call: () => Promise<ServiceResponse<T>>,
  enabled = true,
  initialData?: ServiceResponse<T>,
) {
  const query = useTeamsOperationQuery(
    operation,
    input,
    call,
    enabled,
    initialData,
  );
  return {
    ...query,
    data:
      query.response?.status === "success" && Array.isArray(query.response.data)
        ? { items: query.response.data }
        : undefined,
  };
}
const toast = {
  success: (title: string) => {
    toastManager.add({ title, type: "success" });
  },
  warning: (title: string) => {
    toastManager.add({ title, type: "warning" });
  },
  error: (title: string) => {
    toastManager.add({ title, type: "error" });
  },
};
export function useTeamsOperationMutation<I, T>(
  action: ActionName,
  call: (input: I) => Promise<ServiceResponse<T>>,
  onSuccess?: () => void,
) {
  const client = useQueryClient();
  const router = useRouter();
  return useMutation({
    mutationFn: (input: I) => {
      trackActionIntent(action);
      return call(input);
    },
    meta: { skipGlobalErrorToast: true },
    onSuccess: async (response) => {
      applyResponseToast(response, toast);
      if (response.status === "success") {
        await client.invalidateQueries({ queryKey: ["teams"] });
        // Shared permissions and project access still have legacy consumers during migration.
        await client.invalidateQueries({
          predicate: (query) =>
            Array.isArray(query.queryKey[0]) &&
            ["teams", "permissions", "projectAccess", "organizations"].includes(
              String(query.queryKey[0][0]),
            ),
        });
        onSuccess?.();
        router.refresh();
      }
    },
    onError: () =>
      applyResponseToast(
        {
          status: "error",
          data: null,
          message: "Could not save changes. Please try again.",
          error: { code: "NETWORK_ERROR" },
        },
        toast,
      ),
  });
}
