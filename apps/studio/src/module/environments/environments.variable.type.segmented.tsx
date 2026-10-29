"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import {
  segmentedControlItemSizeClassNames,
  segmentedControlItemVariants,
  segmentedControlRootClassName,
} from "@loftlancer/ui/segmented-control";
import { cn } from "@/lib/utils";

export type VariableType = "secret" | "config";

export function VariableTypeSegmented({
  value,
  onChange,
  id,
  disabled,
}: {
  value: VariableType;
  onChange: (value: VariableType) => void;
  id?: string;
  disabled?: boolean;
}) {
  return (
    <ToggleGroup
      id={id}
      className={cn(segmentedControlRootClassName, "h-9 w-full max-w-sm p-0.5")}
      value={[value]}
      disabled={disabled}
      onValueChange={(values) => {
        const next = values[0];
        if (next === "secret" || next === "config") onChange(next);
      }}
    >
      <Toggle
        value="secret"
        className={cn(
          segmentedControlItemVariants({ size: "default", state: "pressed" }),
          segmentedControlItemSizeClassNames.default,
          "flex-1",
        )}
      >
        Secret
      </Toggle>
      <Toggle
        value="config"
        className={cn(
          segmentedControlItemVariants({ size: "default", state: "pressed" }),
          segmentedControlItemSizeClassNames.default,
          "flex-1",
        )}
      >
        Config
      </Toggle>
    </ToggleGroup>
  );
}
