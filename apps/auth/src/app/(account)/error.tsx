"use client";

import { SegmentError } from "@/shared/components/shared.segment-error";

export default function AccountSegmentError({
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
      title="Account page failed to load"
      fallbackDescription="We could not load this account page."
    />
  );
}
