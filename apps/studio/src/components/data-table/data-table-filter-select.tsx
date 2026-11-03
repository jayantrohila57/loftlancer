"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@loftlancer/ui/select";
import { useMemo } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import type { AppIconName } from "@/lib/icons";
import { iconMutedClassName } from "@/lib/icons";
import { cn } from "@/lib/utils";
import { dataTableFilterSelectDisplayLabel } from "./data-table-filter-labels";

export type DataTableFilterOption = {
  value: string;
  label?: string;
  icon?: AppIconName;
  suffix?: string;
};

export type DataTableFilterSelectProps = {
  value: string;
  onValueChange: (value: string) => void;
  options: DataTableFilterOption[];
  triggerIcon: AppIconName;
  placeholder: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
};

export function DataTableFilterSelect({
  value,
  onValueChange,
  options,
  triggerIcon,
  placeholder,
  ariaLabel,
  className,
  disabled,
}: DataTableFilterSelectProps) {
  const items = useMemo(
    () =>
      options.map((option) => ({
        value: option.value,
        label: dataTableFilterSelectDisplayLabel(
          option.value,
          option.label,
          option.suffix,
        ),
      })),
    [options],
  );

  const selected = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const triggerLabel = selected
    ? dataTableFilterSelectDisplayLabel(
        selected.value,
        selected.label,
        selected.suffix,
      )
    : placeholder;

  return (
    <Select
      value={value}
      items={items}
      disabled={disabled}
      onValueChange={(next) => {
        if (next) onValueChange(next);
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label={ariaLabel}
        className={cn(
          "h-8 w-auto max-w-full min-w-[8.5rem] justify-start gap-1.5 shadow-none",
          className,
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-1.5 truncate">
          <AppIcon
            name={triggerIcon}
            className={cn(iconMutedClassName, "size-4 shrink-0")}
          />
          <span
            className={cn("truncate", !selected && "text-muted-foreground")}
          >
            {triggerLabel}
          </span>
        </span>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => {
          const label = dataTableFilterSelectDisplayLabel(
            option.value,
            option.label,
            option.suffix,
          );
          return (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex min-w-0 items-center gap-1.5">
                {option.icon ? (
                  <AppIcon
                    name={option.icon}
                    className={cn(iconMutedClassName, "size-4 shrink-0")}
                  />
                ) : null}
                <span className="min-w-0 truncate">{label}</span>
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}
