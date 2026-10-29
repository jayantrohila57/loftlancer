"use client";

import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";

/** Dense searchable picker (h-8) used by task filters and the detail sheet. */
export function FieldSelect({
  value,
  onChange,
  options,
  placeholder,
  ariaLabel,
  className,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  options: readonly { value: string; label: string; hint?: string }[];
  placeholder?: string;
  ariaLabel: string;
  className?: string;
  disabled?: boolean;
}) {
  return (
    <SearchableCombobox
      value={value}
      onChange={onChange}
      options={options}
      placeholder={placeholder}
      ariaLabel={ariaLabel}
      className={className ?? "w-36"}
      disabled={disabled}
    />
  );
}
