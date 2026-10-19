"use client";

import type { ProjectOutput } from "@loftlancer/api/types";
import { Frame } from "@loftlancer/ui/frame";
import { layoutGapClass } from "@loftlancer/ui/layout-spacing";
import { cn } from "@/lib/utils";
import { ProjectCard } from "./project-card";

export function ProjectsGridView({
  projects,
  className,
}: {
  projects: ProjectOutput[];
  className?: string;
}) {
  return (
    <Frame className="w-full min-w-0 max-w-full overflow-hidden rounded-xl">
      <div
        className={cn(
          "grid w-full min-w-0 grid-cols-1 items-start sm:grid-cols-2 xl:grid-cols-3 [&>*]:w-full [&>*]:min-w-0",
          layoutGapClass,
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
