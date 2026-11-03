"use client";

import { PageStatusEmpty } from "@features/patterns/core/client/patterns.page-state";
import { Button } from "@loftlancer/ui/button";
import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { getClientErrorMessage } from "@/lib/errors/client-errors";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageStatusEmpty
      icon={AlertTriangle}
      title="Something went wrong"
      description={getClientErrorMessage(error)}
      action={
        <Button type="button" size="sm" onClick={reset}>
          Try again
        </Button>
      }
    />
  );
}
