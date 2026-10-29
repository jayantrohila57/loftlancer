"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { isOrganizationsEnabledOnClient } from "@/lib/organizations";

import { routes } from "@/utils/navigation";

export function OrganizationsFeatureGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!isOrganizationsEnabledOnClient()) {
      router.replace(routes.home());
    }
  }, [router]);

  if (!isOrganizationsEnabledOnClient()) {
    return null;
  }

  return children;
}
