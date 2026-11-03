"use client";

import { Button } from "@loftlancer/ui/button";
import { Spinner } from "@loftlancer/ui/spinner";
import { cn } from "@loftlancer/ui/utils";
import { RotateCcw, Square } from "lucide-react";

export type AiStreamStatus = "streaming" | "error" | "complete";

export interface AiStreamStateProps {
  status: AiStreamStatus;
  errorMessage?: string;
  onStop?: () => void;
  onRetry?: () => void;
  className?: string;
}

/**
 * Shared AI Elements-style stream controls. Product features provide their own
 * content; this keeps stop, retry, and error feedback consistent and accessible.
 */
export function AiStreamState({
  status,
  errorMessage,
  onStop,
  onRetry,
  className,
}: AiStreamStateProps) {
  if (status === "complete") return null;

  if (status === "streaming") {
    return (
      <div
        className={cn(
          "text-muted-foreground flex items-center gap-2 text-sm",
          className,
        )}
        role="status"
      >
        <Spinner className="size-4" aria-hidden />
        <span>Generating response</span>
        {onStop && (
          <Button size="xs" variant="ghost" onClick={onStop}>
            <Square aria-hidden />
            Stop
          </Button>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "text-destructive flex flex-wrap items-center gap-2 text-sm",
        className,
      )}
      role="alert"
    >
      <span>{errorMessage ?? "The response could not be completed."}</span>
      {onRetry && (
        <Button size="xs" variant="outline" onClick={onRetry}>
          <RotateCcw aria-hidden />
          Retry
        </Button>
      )}
    </div>
  );
}
