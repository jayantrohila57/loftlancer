"use client";
import { createContext, type ReactNode, useContext } from "react";

const ScopeContext = createContext<string | null>(null);
export function ModuleScopeProvider({
  orgId,
  children,
}: {
  orgId: string;
  children: ReactNode;
}) {
  return (
    <ScopeContext.Provider value={orgId}>{children}</ScopeContext.Provider>
  );
}
export function useModuleOrganizationId() {
  const orgId = useContext(ScopeContext);
  if (!orgId) throw new Error("Module organization scope is missing");
  return orgId;
}
