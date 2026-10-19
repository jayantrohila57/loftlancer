import type { Metadata } from "next";
import { TeamSettingsPage } from "@/domain/organizations/components/team-settings-page";

export const metadata: Metadata = {
  title: "Team settings",
  description: "Rename or delete this team.",
};

export default async function TeamSettingsRoute({
  params,
}: {
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { org, teamId } = await params;
  return <TeamSettingsPage slug={org} teamId={teamId} />;
}
