"use client";

import { EmptyState } from "@features/patterns/core/client/patterns.empty-state";
import { appIcons } from "@/lib/icons";

type FilteredListNoResultsEmptyProps = {
  title: string;
  description?: string;
};

const DEFAULT_DESCRIPTION =
  "Try adjusting search or filters, or clear filters from the toolbar above.";

/**
 * Zero-result state for URL-filtered project/org lists.
 * Clear-filters control lives only in the toolbar (see issue #62).
 */
export function FilteredListNoResultsEmpty({
  title,
  description = DEFAULT_DESCRIPTION,
}: FilteredListNoResultsEmptyProps) {
  return (
    <EmptyState
      icon={appIcons.searchEmpty}
      title={title}
      description={description}
    />
  );
}
