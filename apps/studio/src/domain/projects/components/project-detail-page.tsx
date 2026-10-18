"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { PageHeaderMetadataSkeleton } from "@/components/layout/page-header-metadata-skeleton";
import { ErrorState } from "@/components/patterns/error-state";
import {
  StatusBadge,
  VisibilityBadge,
} from "@/components/patterns/status-badge";
import DashboardSection from "@/components/section-dashboard";
import { useProjectApps } from "@/domain/apps/hooks/use-project-apps";
import { CreateEnvironmentSheet } from "@/domain/environments/components/create-environment-sheet";
import { useEnvironments } from "@/domain/environments/hooks/use-environments";
import { routes } from "@/utils/navigation";
import { useOrgSlug } from "@/utils/use-route-scope";
import { EditProjectSheet } from "./edit-project-sheet";
import { ProjectActions } from "./project-actions";
import { ProjectDetailStats } from "./project-detail-stats";
import { ProjectMetadataRow } from "./project-metadata-row";
import {
  ProjectOverviewSections,
  ProjectOverviewSectionsSkeleton,
} from "./project-overview-sections";

const E2E_LONG_DESCRIPTION =
  "Taskflow-style workspace for coordinating work across teams. This description is intentionally long so the page header clamps to two lines with an inline more control at the end of the second line, while metadata stays compact beside the title with repository and website links on separate labeled rows.";

interface ProjectDetailPageProps {
  slug: string;
  initialDescription?: string;
}

function ProjectHeaderBadges({
  isPublic,
  isArchived,
  status,
}: {
  isPublic: boolean;
  isArchived: boolean;
  status: "active" | "inactive" | "maintenance";
}) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <VisibilityBadge isPublic={isPublic} />
      {isArchived ? <StatusBadge status="archived" /> : null}
      {!isArchived ? <StatusBadge status={status} /> : null}
    </div>
  );
}

function ProjectDetailPageContent({
  slug,
  initialDescription,
}: ProjectDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const org = useOrgSlug();
  const [editOpen, setEditOpen] = useState(false);
  const {
    project,
    status,
    isLoading,
    projectId,
    createEnvironment,
    isCreating,
  } = useEnvironments(slug);
  const { installed } = useProjectApps(slug);
  const envInstalled = installed.some((a) => a.id === "env");

  useEffect(() => {
    if (searchParams.get("edit") === "1" && status === "success" && project) {
      setEditOpen(true);
    }
  }, [searchParams, status, project]);

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open && searchParams.get("edit") === "1") {
      router.replace(routes.project(org, slug));
    }
  };

  const useE2eLongDescription = searchParams.get("e2eLongDescription") === "1";
  const headerDescription = useE2eLongDescription
    ? E2E_LONG_DESCRIPTION
    : project?.description?.trim() || initialDescription || undefined;

  if (isLoading && !project) {
    return (
      <DashboardSection
        title="Overview"
        description={
          searchParams.get("e2eLongDescription") === "1"
            ? E2E_LONG_DESCRIPTION
            : initialDescription
        }
        action={<Skeleton className="h-8 w-40 rounded-md" />}
        meta={
          <>
            <Skeleton className="h-5 w-16 rounded-md" />
            <Skeleton className="h-5 w-14 rounded-md" />
            <PageHeaderMetadataSkeleton />
          </>
        }
        stats={<ProjectDetailStats slug={slug} />}
      >
        <ProjectOverviewSectionsSkeleton />
      </DashboardSection>
    );
  }

  if (status === "error" || !project) {
    return (
      <DashboardSection title="Overview">
        <ErrorState
          title="Project unavailable"
          description="This project could not be loaded. It may have been deleted."
          onRetry={() => window.location.reload()}
        />
      </DashboardSection>
    );
  }

  return (
    <>
      <DashboardSection
        title="Overview"
        description={headerDescription}
        action={
          <div className="flex shrink-0 items-center gap-2">
            {projectId && envInstalled ? (
              <CreateEnvironmentSheet
                onConfirm={async (name) => {
                  await createEnvironment({ projectId, name });
                }}
                isPending={isCreating}
                triggerText="Add environment"
                compactOnMobile
              />
            ) : null}
            <ProjectActions project={project} />
          </div>
        }
        meta={
          <>
            <ProjectHeaderBadges
              isPublic={project.isPublic}
              isArchived={project.isArchived}
              status={project.status}
            />
            <ProjectMetadataRow project={project} />
          </>
        }
        stats={<ProjectDetailStats slug={slug} />}
      >
        <ProjectOverviewSections slug={slug} />
      </DashboardSection>
      <EditProjectSheet
        project={project}
        open={editOpen}
        onOpenChange={handleEditOpenChange}
      />
    </>
  );
}

function ProjectDetailPageFallback({
  initialDescription,
}: Pick<ProjectDetailPageProps, "initialDescription">) {
  return (
    <DashboardSection title="Overview" description={initialDescription}>
      <ProjectOverviewSectionsSkeleton />
    </DashboardSection>
  );
}

export default function ProjectDetailPage(props: ProjectDetailPageProps) {
  return (
    <Suspense
      fallback={
        <ProjectDetailPageFallback
          initialDescription={props.initialDescription}
        />
      }
    >
      <ProjectDetailPageContent {...props} />
    </Suspense>
  );
}
