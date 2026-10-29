import type { ReactNode } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import type { AppIconName } from "@/lib/icons";
import type {
  ProjectsSort,
  ProjectsStatusFilter,
  ProjectsVisibilityFilter,
} from "@/module/projects/projects.filter.projects";

export type FacetOptionWithIcon<T extends string> = {
  value: T;
  icon: AppIconName;
};

function facetIcon(name: AppIconName): ReactNode {
  return <AppIcon name={name} className="size-4" />;
}

export const PROJECTS_STATUS_FACET_OPTIONS: FacetOptionWithIcon<ProjectsStatusFilter>[] =
  [
    { value: "active", icon: "statusActive" },
    { value: "inactive", icon: "statusInactive" },
    { value: "maintenance", icon: "statusMaintenance" },
    { value: "archived", icon: "statusArchived" },
  ];

export const PROJECTS_VISIBILITY_FACET_OPTIONS: FacetOptionWithIcon<ProjectsVisibilityFilter>[] =
  [
    { value: "private", icon: "lock" },
    { value: "public", icon: "globe" },
  ];

export const PROJECTS_SORT_FILTER_OPTIONS: {
  value: ProjectsSort;
  label: string;
  icon: AppIconName;
}[] = [
  { value: "updated-desc", label: "Updated (newest)", icon: "calendar" },
  { value: "updated-asc", label: "Updated (oldest)", icon: "calendar" },
  { value: "name-asc", label: "Name (A–Z)", icon: "listView" },
  { value: "name-desc", label: "Name (Z–A)", icon: "listView" },
];

export function projectsFacetOptionsWithIcons<T extends string>(
  options: FacetOptionWithIcon<T>[],
) {
  return options.map((option) => ({
    value: option.value,
    icon: facetIcon(option.icon),
  }));
}
