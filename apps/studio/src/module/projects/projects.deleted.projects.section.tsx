"use client";

import { Button } from "@loftlancer/ui/button";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { LocalDateTime } from "@loftlancer/ui/patterns/local-date-time";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ErrorState } from "@/components/patterns/error-state";
import { appIcons } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { trpc } from "@/utils/trpc";

export function DeletedProjectsSection() {
  const queryClient = useQueryClient();
  const deleted = useQuery(trpc.projects.deleted.queryOptions());
  const restore = useMutation({
    ...trpc.projects.restore.mutationOptions(),
    onSuccess: async () => {
      toast.success("Project restored");
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: trpc.projects.list.pathKey(),
        }),
        queryClient.invalidateQueries({
          queryKey: trpc.projects.deleted.pathKey(),
        }),
      ]);
    },
  });

  if (deleted.isPending) {
    return <AccordionSectionSkeleton rows={1} />;
  }
  if (deleted.isError) {
    return (
      <ErrorState
        title="Could not load deleted projects"
        description="Try loading the deleted project list again."
        onRetry={() => void deleted.refetch()}
      />
    );
  }
  return (
    <AccordionSection
      title="Recently deleted"
      description="Restore a project with the environments and variables deleted alongside it."
      defaultOpen={false}
    >
      {deleted.data.items.length === 0 ? (
        <EmptyState
          bare
          icon={appIcons.project}
          title="No recently deleted projects"
          description="Recoverable projects you delete will appear here."
        />
      ) : (
        <ul className="divide-y">
          {deleted.data.items.map((project) => (
            <li
              key={project.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-sm">{project.name}</p>
                <p className="text-muted-foreground text-xs">
                  Deleted{" "}
                  <LocalDateTime value={project.deletedAt} showTimeOnHover />
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={restore.isPending}
                onClick={() => restore.mutate({ id: project.id })}
              >
                Restore
              </Button>
            </li>
          ))}
        </ul>
      )}
    </AccordionSection>
  );
}
