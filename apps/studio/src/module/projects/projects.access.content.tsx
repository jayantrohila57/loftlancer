"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/patterns/error-state";
import { ProjectAccessSection } from "@/domain/projects/components/project-access-section";
import { trpc } from "@/utils/trpc";

export function ProjectAccessPage({ slug }: { slug: string }) {
  const projectQuery = useQuery(trpc.projects.getBySlug.queryOptions({ slug }));
  const project = projectQuery.data?.data?.project;

  if (projectQuery.isPending) return <Skeleton className="h-64 rounded-md" />;
  if (projectQuery.isError) {
    return (
      <ErrorState
        title="Could not load project access"
        description="Try loading this project again."
        onRetry={() => void projectQuery.refetch()}
      />
    );
  }
  if (!project) notFound();

  return <ProjectAccessSection project={project} />;
}
