"use client";
import {
  PageStatusEmpty,
  PageStatusError,
} from "@features/patterns/core/client/patterns.page-state";
import { Button } from "@loftlancer/ui/button";
export function TeamsResponseMessage({
  message,
  error,
  retry,
}: {
  message: string;
  error?: boolean;
  retry?: () => void;
}) {
  return error ? (
    <PageStatusError
      title="Could not load teams"
      description={message}
      onRetry={retry}
    />
  ) : (
    <PageStatusEmpty
      title="Unable to continue"
      description={message}
      action={
        retry ? (
          <Button type="button" variant="outline" onClick={retry}>
            Try again
          </Button>
        ) : undefined
      }
    />
  );
}
