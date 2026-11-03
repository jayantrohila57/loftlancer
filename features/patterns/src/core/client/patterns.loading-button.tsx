"use client";

import { Button, type ButtonProps } from "@loftlancer/ui/button";

export interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  /** Announced to screen readers while loading; the visible label never changes, so width stays fixed. */
  loadingLabel?: string;
}

export function LoadingButton({
  loading = false,
  loadingLabel,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      loading={loading}
      disabled={disabled || loading}
      className={className}
      aria-label={loading && loadingLabel ? loadingLabel : undefined}
      {...props}
    >
      {children}
    </Button>
  );
}
