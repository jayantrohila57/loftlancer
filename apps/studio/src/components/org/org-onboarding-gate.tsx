"use client";
import type { ReactNode } from "react";
export function OrgOnboardingGate({
  children,
}: {
  children: ReactNode;
  initialReady?: boolean;
  className?: string;
}) {
  return <>{children}</>;
}
