import type {
  ActionName,
  ProjectAccessContext,
  TeamAccessContext,
} from "@features/authorization/utils";

export type ProjectAccessLoaderResult = ProjectAccessContext & {
  belongsToOrganization: boolean;
};

export type RequireActionHost = {
  isAppInstalled: (projectId: string, appId: string) => Promise<boolean>;
  hasProjectAppAccess: (input: {
    userId: string;
    organizationId: string;
    projectId: string;
    appId: string;
    bypassRestriction: boolean;
  }) => Promise<boolean>;
  loadCustomOrganizationActions: (
    userId: string,
    organizationId: string,
  ) => Promise<ActionName[]>;
  loadProjectAccessContext: (
    userId: string,
    projectId: string,
    organizationId: string | null | undefined,
    options?: { includeDeleted?: boolean },
  ) => Promise<ProjectAccessLoaderResult | null>;
  loadTeamAccessContext: (
    userId: string,
    teamId: string,
    organizationId: string | null | undefined,
  ) => Promise<(TeamAccessContext & { belongsToOrganization: boolean }) | null>;
  userHasAnyProjectManagerAssignment: (
    userId: string,
    organizationId: string,
  ) => Promise<boolean>;
};

let host: RequireActionHost | null = null;

export function setRequireActionHost(next: RequireActionHost): void {
  host = next;
}

export function getRequireActionHost(): RequireActionHost {
  if (!host) {
    throw new Error(
      "RequireActionHost not registered — import @loftlancer/orpc/actions/require-action-host-register before calling requireAction",
    );
  }
  return host;
}
