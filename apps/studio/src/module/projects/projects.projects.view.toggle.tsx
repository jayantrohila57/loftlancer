"use client";

import { ToggleGroup, ToggleGroupItem } from "@loftlancer/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@loftlancer/ui/tooltip";
import { AppIcon } from "@/components/patterns/app-icon";
import type { ProjectsViewMode } from "@/module/projects/projects.use.projects.list.params";

export function ProjectsViewToggle({
  view,
  onViewChange,
}: {
  view: ProjectsViewMode;
  onViewChange: (view: ProjectsViewMode) => void;
}) {
  return (
    <ToggleGroup
      value={[view]}
      onValueChange={(values) => {
        const next = values[0];
        if (next === "grid" || next === "list") onViewChange(next);
      }}
      aria-label="Projects view"
    >
      <Tooltip>
        <TooltipTrigger
          render={<ToggleGroupItem value="grid" aria-label="Grid view" />}
        >
          <AppIcon name="layoutGrid" className="size-4 text-current" />
        </TooltipTrigger>
        <TooltipContent>Grid view</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger
          render={<ToggleGroupItem value="list" aria-label="List view" />}
        >
          <AppIcon name="listView" className="size-4 text-current" />
        </TooltipTrigger>
        <TooltipContent>List view</TooltipContent>
      </Tooltip>
    </ToggleGroup>
  );
}
