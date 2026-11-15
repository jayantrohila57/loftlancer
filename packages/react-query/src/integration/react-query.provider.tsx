"use client"

import {
  environmentManager,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query"
import type { ReactNode } from "react"

let browserQueryClient: QueryClient | undefined

export function getQueryClient(): QueryClient {
  if (environmentManager.isServer()) return new QueryClient()
  browserQueryClient ??= new QueryClient()
  return browserQueryClient
}

export function QueryProvider({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={getQueryClient()}>
      {children}
    </QueryClientProvider>
  )
}
