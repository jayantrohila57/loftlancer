"use client";

import type { ActionName } from "@features/authorization/utils";
import { toastManager } from "@loftlancer/ui/toast";
import { applyResponseToast } from "@module/shared/client/apply-response-toast";
import { trackActionIntent } from "@module/shared/client/track-action-intent";
import type { ServiceResponse } from "@module/shared/utils/types/utils.service-response.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useActiveOrganization } from "@/components/org/active-organization-context";

export const organizationQueryKeys = {
  all: ["organizations"] as const,
  operation: (organizationId: string, operation: string, input: unknown) =>
    ["organizations", organizationId, operation, input] as const,
};

const toast = {
  success: (title: string) => toastManager.add({ title, type: "success" }),
  warning: (title: string) => toastManager.add({ title, type: "warning" }),
  error: (title: string) => toastManager.add({ title, type: "error" }),
};

export function useOrganizationOperationQuery<T>(
  operation: string,
  input: unknown,
  call: () => Promise<ServiceResponse<T>>,
  enabled = true,
  initialData?: ServiceResponse<T>,
) {
  const { activeOrganizationId } = useActiveOrganization();
  const query = useQuery({
    queryKey: organizationQueryKeys.operation(
      activeOrganizationId ?? "unresolved",
      operation,
      input,
    ),
    queryFn: call,
    enabled: enabled && Boolean(activeOrganizationId),
    initialData,
    staleTime: initialData ? 30_000 : 0,
    meta: { toastOnError: false },
  });
  return {
    ...query,
    response: query.data,
    data:
      query.data?.status === "success" &&
      query.data.data !== null &&
      !Array.isArray(query.data.data)
        ? query.data.data
        : undefined,
  };
}

export function useOrganizationOperationMutation<I, T>(
  action: ActionName,
  call: (input: I) => Promise<ServiceResponse<T>>,
  options: {
    refresh?: boolean;
    responseToast?: boolean;
    onSuccess?: (response: ServiceResponse<T>) => void | Promise<void>;
  } = {},
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
      if (options.responseToast !== false) applyResponseToast(response, toast);
      if (response.status !== "success") return;
      await client.invalidateQueries({ queryKey: organizationQueryKeys.all });
      await client.invalidateQueries({ queryKey: ["permissions"] });
      await options.onSuccess?.(response);
      if (options.refresh) router.refresh();
    },
    onError: () => {
      if (options.responseToast === false) return;
      applyResponseToast(
        {
          status: "error",
          data: null,
          message: "Could not save changes. Please try again.",
          error: { code: "NETWORK_ERROR" },
        },
        toast,
      );
    },
  });
}
