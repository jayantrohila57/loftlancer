"use client";

import { SegmentError } from "@/shared/components/shared.segment-error";

export default function SettingsSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <SegmentError
      error={error}
      reset={reset}
      title="Settings failed to load"
      fallbackDescription="We could not load settings."
    />
  );
}
