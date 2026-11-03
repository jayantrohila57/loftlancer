"use client";

import { Frame } from "@loftlancer/ui/frame";
import type { ProjectOutput } from "@modules/projects/utils/types/utils.project.dto";
import { cn } from "@/lib/utils";
import { ProjectCard } from "@/module/projects/projects.project.card";

export function ProjectsGridView({
  projects,
  className,
}: {
  projects: ProjectOutput[];
  className?: string;
}) {
  return (
    <Frame className="w-full max-w-full min-w-0 overflow-hidden rounded-md">
      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 items-start sm:grid-cols-2 xl:grid-cols-3 [&>*]:w-full [&>*]:min-w-0",
          "gap-3 md:gap-4",
          className,
        )}
      >
        {projects.map((project) => (
          <div key={project.id} className="w-full min-w-0">
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </Frame>
  );
}
