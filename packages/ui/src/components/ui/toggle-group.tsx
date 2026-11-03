"use client";

import { Toggle as TogglePrimitive } from "@base-ui/react/toggle";
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group";
import type * as React from "react";
import { segmentedControlRootClassName } from "../../core/segmented-control";
import { cn } from "../../lib/utils";

export function ToggleGroup({
  className,
  ...props
}: ToggleGroupPrimitive.Props<string>): React.ReactElement {
  return (
    <ToggleGroupPrimitive
      className={cn(segmentedControlRootClassName, "h-8 p-0.5", className)}
      data-slot="toggle-group"
      {...props}
    />
  );
}

export function ToggleGroupItem({
  className,
  ...props
}: TogglePrimitive.Props): React.ReactElement {
  return (
    <TogglePrimitive
      className={cn(
        "text-muted-foreground hover:text-foreground focus-visible:ring-ring data-pressed:bg-background data-pressed:text-foreground dark:data-pressed:bg-input inline-flex size-7 shrink-0 items-center justify-center rounded-md border border-transparent transition-[color,background-color,box-shadow] outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-64 data-pressed:shadow-sm/5 sm:size-7",
        className,
      )}
      data-slot="toggle-group-item"
      {...props}
    />
  );
}
