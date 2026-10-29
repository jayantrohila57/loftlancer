"use client";

import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { OrganizationMemberProfiles } from "@/domain/organizations/components/organization-member-profile";
import { OrganizationSettingsForm } from "@/domain/organizations/components/organization-settings-form";
import { useOrganizationBySlug } from "@/domain/organizations/hooks/use-organization-by-slug";

export function OrganizationMembersPage({ slug }: { slug: string }) {
  const { organization, status, error, reload } = useOrganizationBySlug(slug);
  const [selectedMember, setSelectedMember] = useState<{
    organizationId: string;
    memberId: string;
  } | null>(null);
  const selectedMemberId =
    selectedMember && selectedMember.organizationId === organization?.id
      ? selectedMember.memberId
      : null;

  return (
    <>
      {status === "error" ? (
        <ErrorState
          title="Could not load organization"
          description={error?.message ?? "Try loading the organization again."}
          onRetry={() => void reload()}
        />
      ) : status === "loading" || !organization ? (
        <AccordionSectionSkeleton rows={4} />
      ) : (
        <div className="flex flex-col gap-4">
          <OrganizationSettingsForm
            key={organization.id}
            organizationId={organization.id}
            mode="members"
            onManageMember={(memberId) =>
              setSelectedMember({ organizationId: organization.id, memberId })
            }
          />
          {selectedMemberId ? (
            <OrganizationMemberProfiles
              memberId={selectedMemberId}
              organizationSlug={organization.slug}
              onClose={() => setSelectedMember(null)}
            />
          ) : null}
        </div>
      )}
    </>
  );
}
