"use client";

import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationMemberProfiles } from "./organization-member-profile";
import { OrganizationSectionPage } from "./organization-section-page";
import { OrganizationSettingsForm } from "./organization-settings-form";

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
    <OrganizationSectionPage
      slug={slug}
      title="Members"
      description="Invite teammates and manage organization roles."
    >
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
    </OrganizationSectionPage>
  );
}
