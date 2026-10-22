"use client";

import { useQuery } from "@tanstack/react-query";
import { Suspense } from "react";
import { useCurrentOrgSlug } from "@/components/org/use-current-org-slug";
import { ErrorState } from "@/components/patterns/error-state";
import DashboardSection from "@/components/section-dashboard";
import { trpc } from "@/utils/trpc";
import {
  ProjectOverviewSections,
  ProjectOverviewSectionsSkeleton,
} from "./project-overview-sections";

interface ProjectDetailPageProps {
  slug: string;
}

function ProjectDetailPageContent({ slug }: ProjectDetailPageProps) {
  const { data, isPending, isError } = useQuery(
    trpc.projects.getBySlug.queryOptions({ slug }),
  );
  const project = data?.data?.project;
  const orgSlug = useCurrentOrgSlug() ?? "";

  if (isPending && !project) {
    return <ProjectOverviewSectionsSkeleton />;
  }

  if (isError || !project) {
    return (
      <ErrorState
        title="Project unavailable"
        description="This project could not be loaded. It may have been deleted."
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <DashboardSection title="Overview" back={false} hideTabs>
      <ProjectOverviewSections
        slug={slug}
        orgSlug={orgSlug}
        project={project}
      />
    </DashboardSection>
  );
}

function ProjectDetailPageFallback() {
  return <ProjectOverviewSectionsSkeleton />;
}

export default function ProjectDetailPage(props: ProjectDetailPageProps) {
  return (
    <Suspense fallback={<ProjectDetailPageFallback />}>
      <ProjectDetailPageContent {...props} />
    </Suspense>
  );
}
