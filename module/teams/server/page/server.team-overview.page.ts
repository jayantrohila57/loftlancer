import "server-only";
import {
  resolveOrganizationForPage,
  runPageGuard,
} from "@loftlancer/orpc/page-guards";
import { isOrganizationsEnabled } from "@loftlancer/t3-env/organizations";
import { headers } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { getServerSession } from "@/lib/server-auth";
import { teamGetController } from "../controller/server.team-get.controller";
export const loadTeamsContext = cache(async (slug: string) => {
  if (!isOrganizationsEnabled()) redirect("/");
  const requestHeaders = await headers();
  const session = await getServerSession();
  if (!session) redirect("/");
  const org = await runPageGuard(() =>
    resolveOrganizationForPage(session.user.id, slug),
  );
  return {
    org,
    ctx: {
      userId: session.user.id,
      orgId: org.id,
      ip: requestHeaders.get("x-real-ip"),
      userAgent: requestHeaders.get("user-agent"),
    },
  };
});
export const loadTeamOverview = cache(async (org: string, teamId: string) => {
  const scope = await loadTeamsContext(org);
  const response = await teamGetController({
    input: { teamId },
    ctx: scope.ctx,
  });
  if (response.status === "failed") {
    if (response.message === "Team not found.") notFound();
    redirect("/forbidden");
  }
  return { ...scope, response };
});
