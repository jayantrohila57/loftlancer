"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { PageHeaderActionButton } from "@/components/layout/app-layout";
import DashboardSection from "@/components/section-dashboard";
import { CreateProjectSheet } from "@/module/projects/projects.create.project.sheet";
import { DeletedProjectsSection } from "@/module/projects/projects.deleted.projects.section";
import ProjectList from "@/module/projects/projects.project.list";
import { useProjects } from "@/module/projects/projects.use.projects";
import { Can } from "@/shared/permissions/shared.permissions.can";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";

export function ProjectsPageClient({
  createRoute = false,
  showDeletedProjects = false,
}: {
  /** Rendered at /[org]/projects/new: sheet open, closing returns to the list. */
  createRoute?: boolean;
  showDeletedProjects?: boolean;
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
        <div className="space-y-4">
          <ProjectList list={projectsList} />
          {showDeletedProjects ? <DeletedProjectsSection /> : null}
        </div>
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
