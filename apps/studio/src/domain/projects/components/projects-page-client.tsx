"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import DashboardSection from "@/components/section-dashboard";
import { Can } from "@/domain/permissions/components/can";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";
import { useProjects } from "../hooks/use-projects";
import { CreateProjectSheet } from "./create-project-sheet";
import ProjectList from "./project-list";

export function ProjectsPageClient({
  createRoute = false,
}: {
  /** Rendered at /[org]/projects/new: sheet open, closing returns to the list. */
  createRoute?: boolean;
} = {}) {
  const org = useOrgSlug();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [createOpen, setCreateOpen] = useState(createRoute);
  const projectsList = useProjects();

  useEffect(() => {
    if (searchParams.get("create") === "1") {
      setCreateOpen(true);
    }
  }, [searchParams]);

  const closeCreate = useCallback(() => {
    setCreateOpen(false);
    if (createRoute || searchParams.get("create") === "1") {
      router.replace(routes.projects(org));
    }
  }, [createRoute, org, router, searchParams]);

  const openCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  return (
    <>
      <DashboardSection
        title="Projects"
        description="Projects in this organization. Search, sort, or create a project here."
        back={false}
        hideTabs
        action={
          <Can action="project.create">
            <PageHeaderActionButton label="New project" onClick={openCreate} />
          </Can>
        }
      >
        <ProjectList list={projectsList} />
      </DashboardSection>
      <CreateProjectSheet
        open={createOpen}
        onOpenChange={(next) => {
          if (next) setCreateOpen(true);
          else closeCreate();
        }}
      />
    </>
  );
}
