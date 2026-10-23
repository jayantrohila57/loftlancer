"use client";

import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { appIcons } from "@/lib/icons";
import { OrganizationsListContent } from "./organizations-list-content";
import { OrganizationsListBodySkeleton } from "./skeletons";

export function OrganizationsList() {
  const { orgs, loading, initialLoadDone } = useActiveOrganization();

  if (!initialLoadDone || loading) {
    return <OrganizationsListBodySkeleton />;
  }

  if (orgs.length === 0) {
    return (
      <EmptyState
        icon={appIcons.organization}
        title="No organizations yet"
        description="Create an organization to manage people, teams, and projects."
      />
    );
  }

  return <OrganizationsListContent />;
}
