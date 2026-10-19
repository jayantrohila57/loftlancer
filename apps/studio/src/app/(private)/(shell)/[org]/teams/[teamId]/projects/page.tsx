import type { Metadata } from "next";
import { TeamProjectsPage } from "@/domain/organizations/components/team-projects-page";

export const metadata: Metadata = {
  title: "Team projects",
  description: "Link this team to projects in its organization.",
};

export default async function TeamProjectsRoute({
  params,
}: {
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { org, teamId } = await params;
  return <TeamProjectsPage slug={org} teamId={teamId} />;
}
