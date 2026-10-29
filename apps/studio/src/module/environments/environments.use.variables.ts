"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { actionToast } from "@/lib/action-toast";
import { captureEvent, STUDIO_EVENTS } from "@/lib/posthog";
import { trpc } from "@/utils/trpc";

type VariableOutput = {
  id: string;
  key: string;
  environmentId: string;
  createdAt: Date;
  updatedAt: Date;
  value?: string;
  type?: "secret" | "config";
  note?: string | null;
  createdBy?: { id: string; name: string; image: string | null } | null;
  updatedBy?: { id: string; name: string; image: string | null } | null;
};

interface VariablesQueryResponse {
  status: "success";
  message: string;
  data: VariableOutput[];
  error: string | null;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isPersistedEnvironmentId(environmentId: string) {
  return UUID_RE.test(environmentId);
}

function isPersistedVariableId(id: string) {
  return UUID_RE.test(id);
}

export function useVariables(environmentId: string) {
  const queryClient = useQueryClient();
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [revealingIds, setRevealingIds] = useState<Set<string>>(new Set());
  const canQuery = isPersistedEnvironmentId(environmentId);

  const variablesQuery = useQuery({
    ...trpc.environmentVariables.list.queryOptions({ environmentId }),
    enabled: canQuery,
    meta: { toastOnError: false },
  });

  const createMutation = useMutation(
    trpc.environmentVariables.create.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });

        // Snapshot the previous value
        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;

        // Optimistically add the new variable
        if (previousVariables?.data) {
          const newVariable: VariableOutput = {
            id: `temp-${Date.now()}`,
            key: variables.key,
            value: variables.value,
            environmentId,
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: [...previousVariables.data, newVariable],
            },
          );
        }

        return { previousVariables };
      },
      onSuccess: () => {
        captureEvent(STUDIO_EVENTS.variableCreated);
      },
      onError: (_err, _vars, context) => {
        if (context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            context.previousVariables,
          );
        }
      },
    }),
  );

  const updateMutation = useMutation(
    trpc.environmentVariables.update.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });

        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;

        // Optimistically update the variable
        if (previousVariables?.data) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: previousVariables.data.map((variable: VariableOutput) =>
                variable.id === variables.id
                  ? {
                      ...variable,
                      ...variables,
                      updatedAt: new Date(),
                    }
                  : variable,
              ),
            },
          );
        }

        return { previousVariables };
      },
      onError: (_err, _vars, context) => {
        if (context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            context.previousVariables,
          );
        }
      },
      onSuccess: (_result, variables) => {
        captureEvent(STUDIO_EVENTS.variableUpdated, {
          value_changed: variables.value !== undefined,
        });
        if (variables.value !== undefined) {
          queryClient.setQueryData(
            ["revealedValue", variables.id],
            variables.value,
          );
        }
        queryClient.removeQueries({
          queryKey: trpc.environmentVariables.get.queryKey({
            id: variables.id,
          }),
        });
      },
    }),
  );

  const deleteMutation = useMutation(
    trpc.environmentVariables.delete.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });

        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;

        // Optimistically remove the variable
        if (previousVariables?.data) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: previousVariables.data.filter(
                (variable: VariableOutput) => variable.id !== variables.id,
              ),
            },
          );
        }

        return { previousVariables };
      },
      onSuccess: () => {
        captureEvent(STUDIO_EVENTS.variableDeleted);
      },
      onError: (_err, _vars, context) => {
        if (context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            context.previousVariables,
          );
        }
      },
    }),
  );

  const createBatchMutation = useMutation(
    trpc.environmentVariables.createBatch.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onSuccess: async (_result, input) => {
        captureEvent(STUDIO_EVENTS.variablesBatchCreated, {
          count: input.variables.length,
          environment_count: input.environmentIds.length,
        });
        await Promise.all(
          input.environmentIds.map((id) =>
            queryClient.invalidateQueries({
              queryKey: trpc.environmentVariables.list.queryKey({
                environmentId: id,
              }),
            }),
          ),
        );
        await queryClient.invalidateQueries({
          queryKey: trpc.environmentVariables.countsByEnvironment.queryKey(),
        });
      },
    }),
  );

  const bulkImportMutation = useMutation(
    trpc.environmentVariables.bulkImport.mutationOptions({
      meta: { skipGlobalErrorToast: true },
      onMutate: async (variables) => {
        await queryClient.cancelQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });

        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;

        // Optimistically add only keys that do not exist yet
        if (previousVariables?.data) {
          const existing = new Set(previousVariables.data.map((v) => v.key));
          const newVariables: VariableOutput[] = variables.variables
            .filter((variable) => !existing.has(variable.key))
            .map((variable, index) => ({
              id: `temp-bulk-${Date.now()}-${index}`,
              key: variable.key,
              value: variable.value,
              environmentId,
              createdAt: new Date(),
              updatedAt: new Date(),
            }));

          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: [...previousVariables.data, ...newVariables],
            },
          );
        }

        return { previousVariables };
      },
      onSuccess: (_result, input) => {
        captureEvent(STUDIO_EVENTS.variablesImported, {
          count: input.variables.length,
          overwrite: Boolean(input.overwrite),
        });
      },
      onError: (_err, _vars, context) => {
        if (context?.previousVariables) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            context.previousVariables,
          );
        }
      },
      onSettled: () => {
        void queryClient.invalidateQueries({
          queryKey: trpc.environmentVariables.list.queryKey({ environmentId }),
        });
      },
    }),
  );

  /** Fresh dotenv export of the whole environment (server decrypts + audits). */
  const exportDotenv = async () => {
    const result = await queryClient.fetchQuery({
      ...trpc.environmentVariables.export.queryOptions({ environmentId }),
      staleTime: 0,
    });
    return result.data ?? "";
  };

  const toggleReveal = async (varId: string) => {
    if (revealedIds.has(varId)) {
      setRevealedIds((prev) => {
        const next = new Set(prev);
        next.delete(varId);
        return next;
      });
      queryClient.removeQueries({ queryKey: ["revealedValue", varId] });
      return;
    }

    setRevealingIds((prev) => new Set(prev).add(varId));
    try {
      const result = await queryClient.fetchQuery(
        trpc.environmentVariables.get.queryOptions({ id: varId }),
      );
      if (result?.data) {
        setRevealedIds((prev) => new Set(prev).add(varId));
        queryClient.setQueryData(["revealedValue", varId], result.data.value);
        queryClient.setQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
          (old: VariablesQueryResponse | undefined) => {
            if (!old?.data) return old;
            return {
              ...old,
              data: old.data.map((variable) =>
                variable.id === varId
                  ? { ...variable, value: result.data?.value }
                  : variable,
              ),
            };
          },
        );
      }
    } finally {
      setRevealingIds((prev) => {
        const next = new Set(prev);
        next.delete(varId);
        return next;
      });
    }
  };

  const getRevealedValue = (varId: string) =>
    queryClient.getQueryData<string>(["revealedValue", varId]);

  const fetchVariableValue = async (
    varId: string,
    options?: { force?: boolean },
  ) => {
    if (!options?.force) {
      const cached = queryClient.getQueryData<string>(["revealedValue", varId]);
      if (cached !== undefined) {
        return cached;
      }
    } else {
      queryClient.removeQueries({
        queryKey: trpc.environmentVariables.get.queryKey({ id: varId }),
      });
    }

    const result = await queryClient.fetchQuery(
      trpc.environmentVariables.get.queryOptions({ id: varId }),
    );
    const value = result.data?.value ?? "";
    queryClient.setQueryData(["revealedValue", varId], value);
    return value;
  };

  const status: "loading" | "error" | "empty" | "success" =
    variablesQuery.isLoading
      ? "loading"
      : variablesQuery.isError
        ? "error"
        : variablesQuery.data?.data.length === 0
          ? "empty"
          : "success";

  return {
    variables: variablesQuery.data?.data ?? [],
    status,
    revealedIds,
    revealingIds,
    toggleReveal,
    createVariable: (input: Parameters<typeof createMutation.mutateAsync>[0]) =>
      actionToast(createMutation.mutateAsync(input), {
        loading: "Adding variable…",
        success: "Variable added",
      }),
    createVariablesBatch: (
      input: Parameters<typeof createBatchMutation.mutateAsync>[0],
    ) =>
      actionToast(createBatchMutation.mutateAsync(input), {
        loading: "Saving variables…",
        success: "Variables saved",
      }),
    isCreating: createMutation.isPending || createBatchMutation.isPending,
    updateVariable: (input: Parameters<typeof updateMutation.mutateAsync>[0]) =>
      actionToast(updateMutation.mutateAsync(input), {
        loading: "Saving variable…",
        success: "Variable updated",
      }),
    isUpdating: updateMutation.isPending,
    deleteVariable: async (
      input: Parameters<typeof deleteMutation.mutateAsync>[0],
    ) => {
      if (!isPersistedVariableId(input.id)) {
        const previousVariables = queryClient.getQueryData(
          trpc.environmentVariables.list.queryKey({ environmentId }),
        ) as VariablesQueryResponse | undefined;
        if (previousVariables?.data) {
          queryClient.setQueryData(
            trpc.environmentVariables.list.queryKey({ environmentId }),
            {
              ...previousVariables,
              data: previousVariables.data.filter(
                (variable: VariableOutput) => variable.id !== input.id,
              ),
            },
          );
        }
        return;
      }
      return actionToast(deleteMutation.mutateAsync(input), {
        loading: "Deleting variable…",
        success: "Variable deleted",
      });
    },
    isDeleting: deleteMutation.isPending,
    bulkImport: (input: Parameters<typeof bulkImportMutation.mutateAsync>[0]) =>
      actionToast(bulkImportMutation.mutateAsync(input), {
        loading: "Importing variables…",
        success: "Variables imported",
      }),
    isImporting: bulkImportMutation.isPending,
    exportDotenv,
    getRevealedValue,
    fetchVariableValue,
  };
}
