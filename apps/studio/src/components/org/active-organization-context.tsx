"use client";

import { createContext, type ReactNode, useContext, useMemo } from "react";

export type OrgListItem = {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
};

/** Product reset stub — organization domain UI removed. */
type ActiveOrganizationContextValue = {
  orgs: OrgListItem[];
  initialLoadDone: boolean;
  initialReady: boolean;
  activeOrgId: string | null;
  activeOrganizationId: string | null;
  enabled: boolean;
  isSwitching: boolean;
  setActiveOrgId: (id: string | null) => void;
  afterOrganizationCreated: (org: OrgListItem) => void;
};

const ActiveOrganizationContext =
  createContext<ActiveOrganizationContextValue | null>(null);

const stub: ActiveOrganizationContextValue = {
  orgs: [],
  initialLoadDone: true,
  initialReady: true,
  activeOrgId: null,
  activeOrganizationId: null,
  enabled: false,
  isSwitching: false,
  setActiveOrgId: () => undefined,
  afterOrganizationCreated: () => undefined,
};

export function ActiveOrganizationProvider({
  children,
}: {
  children: ReactNode;
  initialReady?: boolean;
}) {
  const value = useMemo(() => stub, []);
  return (
    <ActiveOrganizationContext.Provider value={value}>
      {children}
    </ActiveOrganizationContext.Provider>
  );
}

export function useActiveOrganization(): ActiveOrganizationContextValue {
  return useContext(ActiveOrganizationContext) ?? stub;
}
