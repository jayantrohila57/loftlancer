"use client";

import type { Route } from "next";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import DashboardSection from "@/components/section-dashboard";
import { Can } from "@/domain/permissions/components/can";
import { routes } from "@/utils/navigation";
import { CreateOrganizationSheet } from "./create-organization-sheet";
import { OrganizationsList } from "./organizations-list";
import { OrganizationsListInvitations } from "./organizations-list-invitations";

/**
 * Organization directory. `/new` opens the creation sheet; closing it returns
 * to the directory route.
 */
export function OrganizationsPageClient({
  createRoute = false,
}: {
  createRoute?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(createRoute);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    if (createRoute) {
      router.replace(routes.organizationsDirectory(), { scroll: false });
    }
  }, [createRoute, router]);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);
  const activeTab = searchParams.get("tab") === "invites" ? "invites" : "all";
  const setActiveTab = useCallback(
    (value: string) => {
      const params = new URLSearchParams(window.location.search);
      params.set("directory", "1");
      if (value === "invites") params.set("tab", value);
      else params.delete("tab");
      const query = params.toString();
      router.replace(`${routes.organizations()}?${query}` as Route, {
        scroll: false,
      });
    },
    [router],
  );

  return (
    <>
      <DashboardSection
        title="Organizations"
        description="Workspaces you belong to, with members, teams, and access settings."
        back={false}
        actionPlacement="header"
        descriptionGapClassName="gap-y-1"
        tabsViewportClassName="py-1"
        action={
          <Can action="organization.create">
            <PageHeaderActionButton
              label="New organization"
              onClick={openCreate}
            />
          </Can>
        }
        tabs={[
          { value: "all", label: "All" },
          { value: "invites", label: "Invitations" },
        ]}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      >
        {activeTab === "invites" ? (
          <OrganizationsListInvitations />
        ) : (
          <OrganizationsList />
        )}
      </DashboardSection>
      <CreateOrganizationSheet
        open={createOpen}
        onOpenChange={(next) => {
          if (next) setCreateOpen(true);
          else closeCreate();
        }}
      />
    </>
  );
}
