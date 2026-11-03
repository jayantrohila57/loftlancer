"use client";

import { AccordionSection } from "@features/patterns/core/client/patterns.accordion-section";
import { ConfirmDialog } from "@features/patterns/core/client/patterns.confirm-dialog";
import { Button } from "@loftlancer/ui/button";
import { useState } from "react";
import { studioORPC } from "@/lib/orpc";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";
import {
  useOrganizationOperationMutation,
  useOrganizationOperationQuery,
} from "../hooks/client.use-organization-operation.hook";

export function OrganizationLifecycleSection() {
  const profile = useOrganizationOperationQuery("getProfile", {}, () =>
    studioORPC.organizations.getProfile({}),
  );
  const canArchive = useCan("organization.archive").allowed;
  const canRestore = useCan("organization.unarchive").allowed;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const archived = Boolean(profile.data?.archivedAt);
  const archive = useOrganizationOperationMutation(
    "organization.archive",
    () => studioORPC.organizations.archive({}),
    { onSuccess: () => setConfirmOpen(false) },
  );
  const restore = useOrganizationOperationMutation(
    "organization.unarchive",
    () => studioORPC.organizations.unarchive({}),
  );

  return (
    <>
      <AccordionSection
        title="Organization lifecycle"
        description="Archive to pause changes while keeping the organization and its data available to restore."
      >
        {profile.isPending ? (
          <div className="bg-muted h-10 animate-pulse rounded-md" />
        ) : profile.isError ? (
          <p className="text-destructive text-sm">
            Could not load organization status.
          </p>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm">
              Status: {archived ? "Archived" : "Active"}
            </p>
            {archived ? (
              canRestore ? (
                <Button
                  disabled={restore.isPending}
                  onClick={() => restore.mutate()}
                >
                  {restore.isPending ? "Restoring…" : "Restore organization"}
                </Button>
              ) : null
            ) : canArchive ? (
              <Button
                variant="destructive"
                onClick={() => setConfirmOpen(true)}
              >
                Archive organization
              </Button>
            ) : null}
          </div>
        )}
      </AccordionSection>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Archive organization"
        description="This keeps the organization and its data, but blocks changes until an owner restores it."
        confirmLabel="Archive organization"
        variant="destructive"
        isPending={archive.isPending}
        onConfirm={() => archive.mutate()}
      />
    </>
  );
}
