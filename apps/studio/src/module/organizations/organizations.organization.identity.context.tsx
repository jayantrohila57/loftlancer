"use client";

import { createContext, useContext } from "react";

export type OrganizationIdentity = {
  id: string;
  name: string;
  slug: string;
};

const OrganizationIdentityContext = createContext<OrganizationIdentity | null>(
  null,
);

export function OrganizationIdentityProvider({
  organization,
  children,
}: {
  organization: OrganizationIdentity;
  children: React.ReactNode;
}) {
  return (
    <OrganizationIdentityContext.Provider value={organization}>
      {children}
    </OrganizationIdentityContext.Provider>
  );
}

export function useOrganizationIdentity() {
  return useContext(OrganizationIdentityContext);
}
