"use client";

import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { ConfirmDialog } from "@loftlancer/ui/patterns/confirm-dialog";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "@/lib/toast";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";
import { trpc } from "@/utils/trpc";

export function OrganizationLifecycleSection() {
  const queryClient = useQueryClient();
  const profile = useQuery(trpc.organizations.getProfile.queryOptions());
  const canArchive = useCan("organization.archive").allowed;
  const canRestore = useCan("organization.unarchive").allowed;
  const [confirmOpen, setConfirmOpen] = useState(false);
  const archived = Boolean(profile.data?.archivedAt);
  const archive = useMutation(
    trpc.organizations.archive.mutationOptions({
      onSuccess: async () => {
        setConfirmOpen(false);
        await queryClient.invalidateQueries();
        toast.success("Organization archived.");
      },
      onError: () => toast.error("Could not archive the organization."),
    }),
  );
  const restore = useMutation(
    trpc.organizations.unarchive.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries();
        toast.success("Organization restored.");
      },
      onError: () => toast.error("Could not restore the organization."),
    }),
  );

  return (
    <>
      <AccordionSection
        title="Organization lifecycle"
        description="Archive to pause changes while keeping the organization and its data available to restore."
      >
        {profile.isPending ? (
          <div className="h-10 animate-pulse rounded-md bg-muted" />
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
