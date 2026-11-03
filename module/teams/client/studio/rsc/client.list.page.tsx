import { ModuleScopeProvider } from "@module/shared/client/client.scope.provider";
import dynamic from "next/dynamic";
import { redirect } from "next/navigation";
import { loadTeamsList } from "../../../server/page/server.team-list.page";
import { routes } from "../config/client.routes";
import { TeamsListSkeleton } from "../skeletons/client.team-list.skeleton";

const Boundary = dynamic(
  () =>
    import("../components/client.list.boundary").then(
      (m) => m.TeamsListBoundary,
    ),
  { loading: () => <TeamsListSkeleton /> },
);
export const metadata = { title: "Teams", description: "Organization teams." };
export async function TeamsListPage({
  params,
  searchParams,
}: {
  params: Promise<{ org: string }>;
  searchParams: Promise<{ team?: string }>;
}) {
  const { org } = await params;
  const scope = await loadTeamsList(org);
  const { team } = await searchParams;
  if (team) redirect(routes.team(org, team) as never);
  if (scope.response.status === "failed") redirect("/forbidden");
  return (
    <ModuleScopeProvider orgId={scope.ctx.orgId}>
      <Boundary
        organizationName={scope.org.name}
        orgId={scope.ctx.orgId}
        slug={org}
        response={scope.response}
      />
    </ModuleScopeProvider>
  );
}
