import type { Route } from "next";
import type { AppIconName } from "@/lib/icons";

import { routes } from "@/utils/navigation";

export type OrganizationSectionId =
  | "projects"
  | "members"
  | "teams"
  | "invitations"
  | "roles"
  | "settings"
  | "timeline";

export type OrganizationSectionDefinition = {
  id: OrganizationSectionId;
  title: string;
  description: string;
  icon: AppIconName;
  href: (orgSlug: string) => Route;
};

export const ORGANIZATION_SECTIONS: readonly OrganizationSectionDefinition[] = [
  {
    id: "projects",
    title: "Projects",
    description: "Projects in this organization, their apps and environments.",
    icon: "project",
    href: (slug) => routes.projects(slug),
  },
  {
    id: "members",
    title: "Members",
    description: "People in this organization and their roles.",
    icon: "member",
    href: (slug) => routes.orgSection(slug, "members"),
  },
  {
    id: "teams",
    title: "Teams",
    description: "Group members into teams for access and collaboration.",
    icon: "member",
    href: (slug) => routes.orgSection(slug, "teams"),
  },
  {
    id: "invitations",
    title: "Invitations",
    description: "Pending email invites awaiting acceptance.",
    icon: "invite",
    href: (slug) => routes.orgSection(slug, "invitations"),
  },
  {
    id: "roles",
    title: "Roles & access",
    description: "Organization roles and permission policies.",
    icon: "lock",
    href: (slug) => routes.orgSection(slug, "roles"),
  },
  {
    id: "settings",
    title: "Settings",
    description: "Profile, slug, and danger zone for this organization.",
    icon: "settings",
    href: (slug) => routes.orgSection(slug, "settings"),
  },
  {
    id: "timeline",
    title: "Activity",
    description: "Recent changes across this organization.",
    icon: "activity",
    href: (slug) => routes.orgSection(slug, "activity"),
  },
];
