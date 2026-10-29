import type { SettingsTab } from "@loftlancer/ui/patterns/settings-frame";
import { routes } from "@/utils/navigation";

export function getProjectTabs({
  org,
  project,
  pathname,
  canListMembers,
  isCheckingMembers,
  canViewActivity,
  isCheckingActivity,
  activityEnabled,
}: {
  org: string;
  project: string;
  pathname: string;
  canListMembers: boolean;
  isCheckingMembers: boolean;
  canViewActivity: boolean;
  isCheckingActivity: boolean;
  activityEnabled: boolean;
}): SettingsTab[] {
  const projectHref = routes.project(org, project);
  const suffix = pathname.slice(projectHref.length).split("/").filter(Boolean);
  const isProjectOverview = suffix.length === 0;
  const isAppsRoute =
    suffix[0] === "apps" ||
    suffix[0] === "tasks" ||
    suffix[0] === "env" ||
    (Boolean(suffix[0]) &&
      !["access", "invitations", "activity", "settings"].includes(
        suffix[0] ?? "",
      ));

  const invitationsDisabledReason = isCheckingMembers
    ? "Checking your project access."
    : "You don't have permission to view project invitations.";
  const activityDisabledReason = !activityEnabled
    ? "Project activity is not available right now."
    : isCheckingActivity
      ? "Checking your project access."
      : "You don't have permission to view project activity.";

  return [
    { href: projectHref, label: "Overview", active: isProjectOverview },
    {
      href: routes.projectSection(org, project, "apps"),
      label: "Apps",
      active: isAppsRoute,
    },
    {
      href: routes.projectSection(org, project, "access"),
      label: "Access",
      active: suffix[0] === "access",
    },
    {
      href: routes.projectSection(org, project, "invitations"),
      label: "Invitations",
      active: suffix[0] === "invitations",
      disabled: isCheckingMembers || !canListMembers,
      disabledReason:
        isCheckingMembers || !canListMembers
          ? invitationsDisabledReason
          : undefined,
    },
    {
      href: routes.projectSection(org, project, "activity"),
      label: "Activity",
      active: suffix[0] === "activity",
      disabled: !activityEnabled || isCheckingActivity || !canViewActivity,
      disabledReason:
        !activityEnabled || isCheckingActivity || !canViewActivity
          ? activityDisabledReason
          : undefined,
    },
    {
      href: routes.projectSection(org, project, "settings"),
      label: "Project settings",
      active: suffix[0] === "settings",
    },
  ];
}
