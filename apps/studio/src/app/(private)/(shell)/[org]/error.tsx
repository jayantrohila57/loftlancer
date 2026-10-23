"use client";

import { SegmentError } from "@/components/patterns/segment-error";

export default function OrganizationDetailSegmentError({
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
      title="Organization failed to load"
      fallbackDescription="We could not load this organization."
    />
  );
}
