"use client";

import {
  Combobox,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxPopup,
  ComboboxTrigger,
} from "@loftlancer/ui/combobox";
import { Skeleton } from "@loftlancer/ui/skeleton";
import { cn } from "@loftlancer/ui/utils";
import { ChevronsUpDownIcon, SearchIcon } from "lucide-react";
import type * as React from "react";
import { useMemo } from "react";

export type ComboboxOption = {
  value: string;
  label: string;
  /** Secondary text (email, slug…) — also searched. */
  hint?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
};

export type SearchableComboboxProps = {
  value: string | null | undefined;
  onChange: (value: string) => void;
  options: readonly ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  ariaLabel: string;
  id?: string;
  className?: string;
  popupClassName?: string;
  disabled?: boolean;
  /** Renders a same-size skeleton so the layout doesn't shift once data lands. */
  loading?: boolean;
  /** Custom trigger element (e.g. a sidebar button); children are its content. */
  trigger?: React.ReactElement;
  triggerContent?: React.ReactNode;
  /** Pinned below the list (e.g. "Create organization" links). */
  footer?: React.ReactNode;
  /** Leading icon inside the default trigger (filters). */
  triggerIcon?: React.ReactNode;
  side?: "top" | "bottom" | "right" | "left";
  align?: "start" | "center" | "end";
};

/**
 * Shared searchable picker (coss ui combobox / reui combobox examples):
 * h-8 text-sm trigger, search box inside the popup, check on the selected
 * row, "No results" empty state and a loading skeleton. Keyboard: type to
 * filter, ↑/↓ to move, Enter to pick, Esc to close.
 */
export function SearchableCombobox({
  value,
  onChange,
  options,
  placeholder = "Select…",
  searchPlaceholder = "Search…",
  emptyText = "No results",
  ariaLabel,
  id,
  className,
  popupClassName,
  disabled,
  loading,
  trigger,
  triggerContent,
  footer,
  triggerIcon,
  side = "bottom",
  align = "start",
}: SearchableComboboxProps) {
  const selected = useMemo(
    () => options.find((o) => o.value === value) ?? null,
    [options, value],
  );

  if (loading && !trigger) {
    return <Skeleton className={cn("h-8 w-full rounded-md", className)} />;
  }

  return (
    <Combobox<ComboboxOption>
      items={options as ComboboxOption[]}
      value={selected}
      onValueChange={(next) => {
        if (next) onChange(next.value);
      }}
      itemToStringLabel={(item) => item.label}
      itemToStringValue={(item) => `${item.label} ${item.hint ?? ""}`}
      isItemEqualToValue={(a, b) => a.value === b.value}
      disabled={disabled}
    >
      {trigger ? (
        <ComboboxTrigger render={trigger} aria-label={ariaLabel} id={id}>
          {triggerContent}
        </ComboboxTrigger>
      ) : (
        <ComboboxTrigger
          id={id}
          aria-label={ariaLabel}
          className={cn(
            "border-border/60 bg-background hover:bg-accent/50 focus-visible:ring-ring data-popup-open:bg-accent/50 inline-flex h-8 w-full min-w-0 items-center justify-between gap-1.5 rounded-md border px-2.5 text-start text-sm shadow-none transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-64",
            className,
          )}
        >
          <span
            className={cn(
              "flex min-w-0 items-center gap-1.5 truncate",
              !selected && "text-muted-foreground",
            )}
          >
            {triggerIcon ?? selected?.icon}
            <span className="truncate">{selected?.label ?? placeholder}</span>
          </span>
          <ChevronsUpDownIcon
            aria-hidden
            className="text-muted-foreground size-3.5 shrink-0"
          />
        </ComboboxTrigger>
      )}
      <ComboboxPopup
        side={side}
        align={align}
        className={cn(
          "w-(--anchor-width) min-w-56",
          options.some((o) => o.hint) && "min-w-80",
          popupClassName,
        )}
      >
        <div className="border-border/60 border-b p-1">
          <ComboboxInput
            size="sm"
            showTrigger={false}
            placeholder={searchPlaceholder}
            aria-label={`Search ${ariaLabel.toLowerCase()}`}
            startAddon={<SearchIcon />}
            className="border-0 shadow-none ring-0 before:hidden"
          />
        </div>
        <ComboboxEmpty>{emptyText}</ComboboxEmpty>
        <ComboboxList>
          {(item: ComboboxOption) => (
            <ComboboxItem
              key={item.value}
              value={item}
              disabled={item.disabled}
            >
              <span
                className="flex min-w-0 items-center gap-1.5"
                title={item.hint ? `${item.label} · ${item.hint}` : item.label}
              >
                {item.icon}
                {item.hint ? (
                  // Name over muted email; both wrap instead of truncating.
                  <span className="flex min-w-0 flex-col">
                    <span className="break-words">{item.label}</span>
                    <span className="text-muted-foreground text-xs break-all">
                      {item.hint}
                    </span>
                  </span>
                ) : (
                  <span className="min-w-0 break-words">{item.label}</span>
                )}
              </span>
            </ComboboxItem>
          )}
        </ComboboxList>
        {footer ? (
          <div className="border-border/60 border-t p-1">{footer}</div>
        ) : null}
      </ComboboxPopup>
    </Combobox>
  );
}
