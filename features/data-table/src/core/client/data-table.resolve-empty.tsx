import { Button } from "@loftlancer/ui/button";
import { SearchX } from "lucide-react";
import type { ReactNode } from "react";
import type { DataTableEmptyConfig } from "../../types/data-table.empty.types";
import { DataTableEmpty } from "./data-table.empty";

export function resolveDataTableEmptyMarkup({
  config,
  variant,
  onClearSearch,
  compact = true,
  fallbackTitle = "No results.",
}: {
  config?: DataTableEmptyConfig;
  variant: "empty" | "noResults";
  onClearSearch?: () => void;
  compact?: boolean;
  fallbackTitle?: string;
}): ReactNode {
  if (!config) {
    if (variant === "noResults" && onClearSearch) {
      return (
        <DataTableEmpty
          compact={compact}
          icon={SearchX}
          title="No results"
          description="Try adjusting your search."
          action={
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={onClearSearch}
            >
              Clear search
            </Button>
          }
        />
      );
    }
    return <DataTableEmpty compact={compact} title={fallbackTitle} />;
  }

  const slice =
    variant === "noResults" ? (config.noResults ?? config.empty) : config.empty;

  let action = slice.action;
  if (variant === "noResults" && onClearSearch && !action) {
    action = (
      <Button type="button" size="sm" variant="outline" onClick={onClearSearch}>
        Clear search
      </Button>
    );
  }

  return (
    <DataTableEmpty
      compact={compact}
      icon={slice.icon}
      title={slice.title}
      description={slice.description}
      action={action}
    />
  );
}
