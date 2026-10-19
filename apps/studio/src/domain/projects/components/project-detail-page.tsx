"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { ErrorState } from "@/components/patterns/error-state";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrgSlug } from "@/utils/use-route-scope";
import { EditProjectSheet } from "./edit-project-sheet";
import {
  ProjectOverviewSections,
  ProjectOverviewSectionsSkeleton,
} from "./project-overview-sections";

interface ProjectDetailPageProps {
  slug: string;
}

function ProjectDetailPageContent({ slug }: ProjectDetailPageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const org = useOrgSlug();
  const [editOpen, setEditOpen] = useState(false);
  const { data, isPending, isError } = useQuery(
    trpc.projects.getBySlug.queryOptions({ slug }),
  );
  const project = data?.data?.project;

  useEffect(() => {
    if (searchParams.get("edit") === "1" && !isPending && project) {
      setEditOpen(true);
    }
  }, [searchParams, isPending, project]);

  const handleEditOpenChange = (open: boolean) => {
    setEditOpen(open);
    if (!open && searchParams.get("edit") === "1") {
      router.replace(routes.project(org, slug));
    }
  };

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
    <>
      <ProjectOverviewSections slug={slug} project={project} />
      <EditProjectSheet
        project={project}
        open={editOpen}
        onOpenChange={handleEditOpenChange}
      />
    </>
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
