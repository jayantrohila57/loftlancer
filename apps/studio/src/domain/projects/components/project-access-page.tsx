"use client";

import { Skeleton } from "@loftlancer/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { notFound } from "next/navigation";
import { ErrorState } from "@/components/patterns/error-state";
import { trpc } from "@/utils/trpc";
import { ProjectAccessSection } from "./project-access-section";

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

  return (
    <section className="space-y-3">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Access</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage project managers, teams with access, and individual access.
        </p>
      </div>
      <ProjectAccessSection project={project} />
    </section>
  );
}
