"use client";

import { cn } from "@/lib/utils";

interface SecretValueProps {
  revealed: boolean;
  value?: string;
  className?: string;
  /** When false and revealed, long values stay on one line with ellipsis */
  expanded?: boolean;
}

export function SecretValue({
  revealed,
  value,
  className,
  expanded = false,
}: SecretValueProps) {
  return (
    <span
      className={cn(
        "text-muted-foreground block min-h-[1.25rem] max-w-full font-mono text-sm",
        revealed && !expanded && "truncate",
        revealed && expanded && "break-words wrap-anywhere whitespace-pre-wrap",
        className,
      )}
      aria-hidden={!revealed}
      title={revealed && !expanded && value ? value : undefined}
    >
      {revealed ? (value ?? "—") : "••••••••"}
    </span>
  );
}
