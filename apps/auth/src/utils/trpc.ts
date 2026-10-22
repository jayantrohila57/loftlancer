import type { AccountAppRouter } from "@loftlancer/api/routers/account-app";
import { transformer } from "@loftlancer/api/transformer";
import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createTRPCClient, httpBatchLink } from "@trpc/client";
import {
  createTRPCContext,
  createTRPCOptionsProxy,
} from "@trpc/tanstack-react-query";
import { withBasePath } from "@/lib/base-path";
import {
  getClientErrorMessage,
  isBenignClientError,
  isNetworkError,
} from "@/lib/errors/client-errors";
import { toast } from "@/lib/toast";

const makeQueryClient = () =>
  new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.toastOnError === false) return;
        if (isBenignClientError(error)) return;
        const message = getClientErrorMessage(
          error,
          "Failed to load data. Please try again.",
        );
        toast.error(message, {
          id: `query-error-${query.queryHash}`,
          action: {
            label: "Retry",
            onClick: () => {
              void query.fetch();
            },
          },
        });
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (mutation.meta?.skipGlobalErrorToast) return;
        toast.error(
          getClientErrorMessage(error, "Action failed. Please try again."),
        );
      },
    }),
    defaultOptions: {
      queries: {
        retry: (failureCount, error) => {
          if (error instanceof Error && error.name === "TimeoutError") {
            return false;
          }
          if (isNetworkError(error)) return failureCount < 2;
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

let browserQueryClient: QueryClient | undefined;

export const getQueryClient = () => {
  if (typeof window === "undefined") {
    return makeQueryClient();
  }
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
};

const t = createTRPCContext<AccountAppRouter>();

export const TRPCProvider = t.TRPCProvider;
export const useTRPC = t.useTRPC;

export const createTrpcClient = () =>
  createTRPCClient<AccountAppRouter>({
    links: [
      httpBatchLink({
        url: withBasePath("/api/trpc"),
        transformer,
        fetch(url, options) {
          const timeoutSignal =
            options?.method === "GET" ? AbortSignal.timeout(10_000) : undefined;
          const requestSignal = options?.signal;
          const signal = timeoutSignal
            ? requestSignal
              ? AbortSignal.any([requestSignal, timeoutSignal])
              : timeoutSignal
            : requestSignal;
          return fetch(url, {
            ...options,
            signal,
            credentials: "include",
          }).catch((error) => {
            if (timeoutSignal?.aborted) {
              const timeoutError = new Error(
                "This request took longer than expected. Please try again.",
              );
              timeoutError.name = "TimeoutError";
              throw timeoutError;
            }
            if (isNetworkError(error)) {
              throw new TypeError("Failed to fetch");
            }
            throw error;
          });
        },
      }),
    ],
  });

export const queryClient = getQueryClient();
export const trpcClient = createTrpcClient();

export const trpc = createTRPCOptionsProxy<AccountAppRouter>({
  client: trpcClient,
  queryClient,
});
