"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { Checkbox } from "@loftlancer/ui/checkbox";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxTrigger,
} from "@loftlancer/ui/combobox";
import { ScrollArea } from "@loftlancer/ui/scroll-area";
import { selectTriggerVariants } from "@loftlancer/ui/select";
import { Separator } from "@loftlancer/ui/separator";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { Spinner } from "@loftlancer/ui/spinner";
import type { LucideIcon } from "lucide-react";
import { ListFilter } from "lucide-react";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import type { AppIconName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { formatDataTableFilterLabel } from "./data-table-filter-labels";
import {
  type UseDataTableFacetedFilterOptions,
  useDataTableFacetedFilter,
} from "./use-data-table-faceted-filter";

export type DataTableFacetedFilterOption<T extends string = string> = {
  value: T;
  label?: string;
  icon?: ReactNode;
  count?: number;
};

export type DataTableFacetedFilterProps<T extends string = string> = {
  title: string;
  /** Leading icon on trigger; defaults to filter icon */
  filterIcon?: LucideIcon | AppIconName;
  options: DataTableFacetedFilterOption<T>[];
  value: T[];
  onValueChange: (value: T[]) => void | Promise<void>;
  multiple?: boolean;
  isLoading?: boolean;
  className?: string;
  /** Accessible label for the trigger */
  ariaLabel?: string;
  /** Override trigger badge count (defaults to applied selection length) */
  badgeCount?: number;
  /** Show combobox search field (default true). */
  searchable?: boolean;
  /** Disable trigger (e.g. while table refetch is in flight). */
  disabled?: boolean;
} & UseDataTableFacetedFilterOptions<T>;

function FilterTriggerIcon({
  filterIcon,
}: {
  filterIcon?: LucideIcon | AppIconName;
}) {
  if (!filterIcon) {
    return <ListFilter className="size-4 shrink-0 opacity-80" aria-hidden />;
  }
  if (typeof filterIcon === "string") {
    return (
      <AppIcon name={filterIcon} className="size-4 shrink-0 text-current" />
    );
  }
  const Icon = filterIcon;
  return <Icon className="size-4 shrink-0 opacity-80" aria-hidden />;
}

function optionLabel<T extends string>(
  option: DataTableFacetedFilterOption<T>,
) {
  return option.label ?? formatDataTableFilterLabel(option.value);
}

export function DataTableFacetedFilter<T extends string = string>({
  title,
  filterIcon,
  options,
  value,
  onValueChange,
  multiple = true,
  isLoading = false,
  className,
  ariaLabel,
  badgeCount,
  searchable = true,
  disabled = false,
  refetch,
  getResultCount,
  onApplyingChange,
}: DataTableFacetedFilterProps<T>) {
  const [query, setQuery] = useState("");
  const {
    open,
    setOpen,
    pending,
    setPending,
    isApplying,
    applyPending,
    clearFilter,
  } = useDataTableFacetedFilter(value, onValueChange, {
    refetch,
    getResultCount,
    onApplyingChange,
  });

  const filteredOptions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return options;
    return options.filter((option) =>
      optionLabel(option).toLowerCase().includes(q),
    );
  }, [options, query]);

  const selectedCount = badgeCount ?? value.length;

  const toggleOption = (optionValue: T, checked: boolean) => {
    if (multiple) {
      setPending((prev) =>
        checked
          ? [...prev, optionValue]
          : prev.filter((item) => item !== optionValue),
      );
      return;
    }
    setPending(checked ? [optionValue] : []);
  };

  return (
    <Combobox
      open={open}
      onOpenChange={setOpen}
      inputValue={query}
      onInputValueChange={setQuery}
    >
      <ComboboxTrigger
        disabled={disabled || isApplying}
        className={cn(
          selectTriggerVariants({ size: "sm" }),
          "h-8 w-auto max-w-full min-w-[8.5rem] justify-start gap-1.5",
          className,
        )}
        aria-label={ariaLabel ?? title}
      >
        <span className="flex min-w-0 items-center gap-1.5">
          <FilterTriggerIcon filterIcon={filterIcon} />
          <span className="truncate">{title}</span>
          {selectedCount > 0 ? (
            <Badge variant="secondary" size="sm" className="shrink-0">
              {selectedCount}
            </Badge>
          ) : null}
        </span>
      </ComboboxTrigger>
      <ComboboxPopup align="start" className="w-64 p-0">
        <div className="flex flex-col gap-0">
          {searchable ? (
            <div className="border-b p-2">
              <ComboboxInput
                size="sm"
                showTrigger={false}
                placeholder={`Search ${title.toLowerCase()}…`}
                aria-label={`Search ${title}`}
              />
            </div>
          ) : null}
          <ScrollArea
            overscrollContain
            scrollbarGutter
            className="max-h-60 min-h-0"
          >
            <div className="p-1">
              {isLoading ? (
                <div className="flex flex-col gap-2 p-2">
                  {(
                    [
                      "filter-skeleton-a",
                      "filter-skeleton-b",
                      "filter-skeleton-c",
                      "filter-skeleton-d",
                      "filter-skeleton-e",
                    ] as const
                  ).map((skeletonKey) => (
                    <div
                      key={skeletonKey}
                      className="flex items-center gap-2 px-1"
                    >
                      <Skeleton className="size-4 shrink-0 rounded-[.25rem]" />
                      <Skeleton className="h-4 flex-1" />
                      <Skeleton className="h-4 w-8" />
                    </div>
                  ))}
                </div>
              ) : filteredOptions.length === 0 ? (
                <p className="text-muted-foreground px-2 py-6 text-center text-sm">
                  No results.
                </p>
              ) : (
                filteredOptions.map((option) => {
                  const checked = pending.includes(option.value);
                  const label = optionLabel(option);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      className="hover:bg-accent hover:text-accent-foreground flex w-full cursor-default items-center gap-2 rounded-sm px-2 py-1.5 text-left text-sm outline-none"
                      onClick={() => toggleOption(option.value, !checked)}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(next) =>
                          toggleOption(option.value, next === true)
                        }
                        aria-label={label}
                        onClick={(event) => event.stopPropagation()}
                      />
                      {option.icon ? (
                        <span className="text-muted-foreground flex shrink-0">
                          {option.icon}
                        </span>
                      ) : null}
                      <span className="min-w-0 flex-1 truncate">{label}</span>
                      {option.count !== undefined ? (
                        <span className="text-muted-foreground text-xs tabular-nums">
                          {option.count}
                        </span>
                      ) : null}
                    </button>
                  );
                })
              )}
            </div>
          </ScrollArea>
          <Separator />
          <div className="flex items-center justify-between gap-2 p-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2"
              disabled={
                isApplying || (pending.length === 0 && value.length === 0)
              }
              onClick={() => void clearFilter()}
            >
              Clear
            </Button>
            <Button
              type="button"
              size="sm"
              className="h-8 gap-2"
              disabled={isApplying}
              onClick={() => void applyPending()}
            >
              {isApplying ? <Spinner className="size-3.5" /> : null}
              Apply
            </Button>
          </div>
        </div>
      </ComboboxPopup>
    </Combobox>
  );
}
