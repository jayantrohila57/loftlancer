"use client";

import { useOnlineStatus } from "@features/patterns/core/client/patterns.use-online-status.hook";
import { WifiOff } from "lucide-react";

export function OfflineBanner() {
  const online = useOnlineStatus();

  if (online) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-amber-950 dark:text-amber-100"
    >
      <WifiOff className="me-2 inline size-4 align-text-bottom" aria-hidden />
      You are offline. Changes will sync when your connection returns.
    </div>
  );
}
