import { routes } from "@features/shell/utils/shell.studio-routes.utils";
export const basePath = (org: string) => routes.orgSection(org, "teams");
export const sidebarSegment = "teams";
export function tabs(org: string, teamId: string) {
  return [
    { href: routes.team(org, teamId), label: "Overview" },
    ...(["members", "projects", "invitations", "settings"] as const).map(
      (section) => ({
        href: routes.teamSection(org, teamId, section),
        label:
          section === "settings"
            ? "Team settings"
            : section[0].toUpperCase() + section.slice(1),
      }),
    ),
  ];
}
export { routes };
