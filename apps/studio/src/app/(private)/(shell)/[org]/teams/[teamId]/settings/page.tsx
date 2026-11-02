import type { Metadata } from "next";
import { TeamSection } from "@/module/teams/teams.section";
import { TeamSettingsPage } from "@/module/teams/teams.settings.content";

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
  return (
    <TeamSection
      title="Team settings"
      description="Manage this team’s identity and lifecycle."
    >
      <TeamSettingsPage slug={org} teamId={teamId} />
    </TeamSection>
  );
}
