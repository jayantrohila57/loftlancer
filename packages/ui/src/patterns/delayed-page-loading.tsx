"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import { PageStatusError } from "./page-state";

const DEFAULT_DELAY_MS = 300;
const DEFAULT_TIMEOUT_MS = 10_000;

/** Delay route skeletons to avoid flashing, then offer recovery on long loads. */
export function DelayedPageLoading({
  fallback,
  delayMs = DEFAULT_DELAY_MS,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  onRetry,
}: {
  fallback: ReactNode;
  delayMs?: number;
  timeoutMs?: number;
  onRetry?: () => void;
}) {
  const [visible, setVisible] = useState(false);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    const showTimer = window.setTimeout(() => setVisible(true), delayMs);
    const timeoutTimer = window.setTimeout(() => setTimedOut(true), timeoutMs);
    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(timeoutTimer);
    };
  }, [delayMs, timeoutMs]);

  if (timedOut) {
    return (
      <PageStatusError
        title="This is taking longer than expected"
        description="The page did not finish loading. Try again."
        onRetry={onRetry ?? (() => window.location.reload())}
      />
    );
  }

  return visible ? fallback : null;
}
