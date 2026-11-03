"use client";

import {
  LoadingButton,
  type LoadingButtonProps,
} from "./patterns.loading-button";

interface SubmitButtonProps extends LoadingButtonProps {
  isLoading?: boolean;
}

export function SubmitButton({
  isLoading,
  loadingLabel = "Saving…",
  children,
  disabled,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <LoadingButton
      type="submit"
      loading={isLoading}
      loadingLabel={loadingLabel}
      disabled={disabled}
      className={className}
      {...props}
    >
      {children}
    </LoadingButton>
  );
}
