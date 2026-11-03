"use client";
import { PageStatusError } from "@features/patterns/core/client/patterns.page-state";
export function TeamsRouteError({ reset }: { reset: () => void }) {
  return <PageStatusError title="Could not load teams" onRetry={reset} />;
}
