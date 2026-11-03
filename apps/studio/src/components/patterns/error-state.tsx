"use client";

import { Button } from "@loftlancer/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@loftlancer/ui/empty";
import { AlertTriangle } from "lucide-react";
import { getClientErrorMessage } from "@/lib/errors/client-errors";

interface ErrorStateProps {
  title?: string;
  description?: string;
  /** When set, raw server / SQL details in `description` are replaced with this text. */
  safeDescriptionFallback?: string;
  onRetry?: () => void;
  retryLabel?: string;
}

export function ErrorState({
  title = "Something went wrong",
  description = "We could not load this content. Please try again.",
  safeDescriptionFallback = "We could not load this content. Please try again.",
  onRetry,
  retryLabel = "Try again",
}: ErrorStateProps) {
  const safeDescription = getClientErrorMessage(
    description ? new Error(description) : null,
    safeDescriptionFallback,
  );

  return (
    <Empty className="border-destructive/30 bg-destructive/5 min-h-48 w-full border">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <AlertTriangle className="text-destructive size-6" aria-hidden />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{safeDescription}</EmptyDescription>
      </EmptyHeader>
      {onRetry && (
        <EmptyContent>
          <Button type="button" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        </EmptyContent>
      )}
    </Empty>
  );
}
