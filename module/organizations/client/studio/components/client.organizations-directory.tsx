"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import { useCan } from "@/shared/permissions/shared.permissions.use.permissions";
import { routes } from "@/utils/navigation";
import { CreateOrganizationSheet } from "./client.create-organization.sheet";
import { MyOrganizationInvitationsList } from "./client.my-invitations.list";
import { OrganizationListContent } from "./client.organization-list.content";

export function OrganizationsDirectory({
  createRoute = false,
}: {
  createRoute?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(createRoute);
  const canCreate = useCan("organization.create");
  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    if (createRoute)
      router.replace(routes.organizationsDirectory(), { scroll: false });
  }, [createRoute, router]);

  return (
    <div className="min-w-0 space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="font-semibold text-2xl tracking-tight">
            Organizations
          </h1>
          <p className="mt-1 text-muted-foreground text-sm">
            Organizations you belong to, with members, teams, and access
            settings.
          </p>
        </div>
        {canCreate.allowed ? (
          <PageHeaderActionButton
            label="New organization"
            onClick={() => setCreateOpen(true)}
          />
        ) : null}
      </header>
      {searchParams.get("tab") === "invites" ? (
        <MyOrganizationInvitationsList />
      ) : (
        <OrganizationListContent />
      )}
      <CreateOrganizationSheet
        open={createOpen}
        onOpenChange={(next) => (next ? setCreateOpen(true) : closeCreate())}
      />
    </div>
  );
}
