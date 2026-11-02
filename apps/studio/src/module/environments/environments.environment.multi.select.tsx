"use client";

import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { FormField } from "@/components/patterns/form-field";
import { cn } from "@/lib/utils";

interface EnvironmentOption {
  id: string;
  name: string;
}

export function EnvironmentMultiSelect({
  environments,
  value,
  onChange,
  error,
}: {
  environments: EnvironmentOption[];
  value: string[];
  onChange: (ids: string[]) => void;
  error?: string;
}) {
  return (
    <FormField
      id="var-environments"
      label="Environments"
      hint="Variables will be created in each selected environment."
      error={error}
      required
    >
      <ToggleGroup
        className="flex flex-wrap gap-1.5"
        value={value}
        onValueChange={(ids) => onChange(ids)}
      >
        {environments.map((env) => {
          const selected = value.includes(env.id);
          return (
            <Toggle
              key={env.id}
              value={env.id}
              aria-pressed={selected}
              className={cn(
                "inline-flex h-8 items-center rounded-md border px-2.5 font-medium text-sm transition-colors",
                selected
                  ? "border-primary/30 bg-primary/10 text-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground",
              )}
            >
              {env.name}
            </Toggle>
          );
        })}
      </ToggleGroup>
    </FormField>
  );
}
