"use client";

import { Search } from "lucide-react";
import type { ReactNode } from "react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "../components/ui/input-group";
import { layoutGapClass } from "../lib/layout-spacing";
import { cn } from "../lib/utils";

export type DataTableToolbarProps = {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  /** Inline filters beside search (status, visibility, etc.) */
  filter?: ReactNode;
  /** View toggles or secondary chrome before the primary action */
  trailing?: ReactNode;
  primaryAction?: ReactNode;
  className?: string;
};

export function DataTableToolbar({
  searchPlaceholder = "Search…",
  searchValue,
  onSearchChange,
  filter,
  trailing,
  primaryAction,
  className,
}: DataTableToolbarProps) {
  const showSearch = onSearchChange !== undefined;

  if (!showSearch && !filter && !trailing && !primaryAction) {
    return null;
  }

  return (
    <div
      className={cn(
        "flex min-w-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className,
      )}
    >
      <div
        className={cn(
          "flex min-w-0 flex-1 flex-wrap items-center",
          layoutGapClass,
        )}
      >
        {showSearch ? (
          <InputGroup
            className="h-10 w-full min-w-0 shrink-0 sm:h-8 sm:max-w-xs"
            data-size="sm"
          >
            <InputGroupAddon>
              <InputGroupText>
                <Search className="size-4 shrink-0" aria-hidden />
              </InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              size="sm"
              value={searchValue ?? ""}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder={searchPlaceholder}
              className="h-10 sm:h-8"
              aria-label={searchPlaceholder}
            />
          </InputGroup>
        ) : null}
        {filter ? (
          <div
            className={cn(
              "flex min-w-0 flex-wrap items-center",
              layoutGapClass,
            )}
          >
            {filter}
          </div>
        ) : null}
      </div>
      {(trailing || primaryAction) && (
        <div
          className={cn(
            "flex w-full shrink-0 flex-wrap items-center justify-end sm:w-auto",
            layoutGapClass,
          )}
        >
          {trailing}
          {primaryAction ? (
            <div className="w-full sm:w-auto [&>*]:w-full sm:[&>*]:w-auto">
              {primaryAction}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}
