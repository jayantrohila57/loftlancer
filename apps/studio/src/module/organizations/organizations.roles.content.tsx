"use client";

import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import type { ReactNode } from "react";
import { useActiveOrganization } from "@/components/org/active-organization-context";
import { ErrorState } from "@/components/patterns/error-state";
import { OrganizationPermissionsMatrix } from "@/module/organizations/organizations.organization.permissions.matrix";
import { OrganizationRoleCards } from "@/module/organizations/organizations.organization.role.cards";
import { useOrganizationBySlug } from "@/module/organizations/organizations.use.organization.by.slug";
import { orgSectionAction } from "@/shared/permissions/shared.permissions.org.section.actions";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";

export function OrganizationRolesPage({ slug }: { slug: string }) {
  const { organization, status, error } = useOrganizationBySlug(slug);
  const { isSwitching } = useActiveOrganization();
  const rolesAction = orgSectionAction("roles");
  const { allowed, isLoading: permissionsLoading } = useCan(rolesAction);

  let body: ReactNode;
  if (status === "loading" || !organization) {
    body = (
      <div className="flex flex-col gap-4">
        <AccordionSectionSkeleton rows={3} />
        <AccordionSectionSkeleton rows={3} />
        <AccordionSectionSkeleton rows={3} />
        <AccordionSectionSkeleton rows={3} />
      </div>
    );
  } else if (status === "error") {
    body = (
      <ErrorState
        title="Could not load organization"
        description={error?.message ?? "Try refreshing the page."}
      />
    );
  } else if (isSwitching || permissionsLoading) {
    body = (
      <div className="flex flex-col gap-4">
        <AccordionSectionSkeleton rows={3} />
        <AccordionSectionSkeleton rows={3} />
        <AccordionSectionSkeleton rows={3} />
        <AccordionSectionSkeleton rows={3} />
      </div>
    );
  } else if (!allowed) {
    body = (
      <ErrorState
        title="Not allowed"
        description="You do not have permission to view roles and access for this organization."
      />
    );
  } else {
    body = (
      <div className="flex flex-col gap-4">
        <OrganizationRoleCards />
        <OrganizationPermissionsMatrix />
      </div>
    );
  }

  return <>{body}</>;
}
