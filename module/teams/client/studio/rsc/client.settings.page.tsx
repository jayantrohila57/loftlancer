import { TeamSection } from "@module/teams/client/studio/components/client.section.content";
import type { Metadata } from "next";
import dynamic from "next/dynamic";
import { TeamOverviewSkeleton } from "../skeletons/client.team-overview.skeleton";

const TeamSettingsPage = dynamic(
  () =>
    import(
      "@module/teams/client/studio/components/client.settings.content"
    ).then((m) => m.TeamSettingsPage),
  { loading: () => <TeamOverviewSkeleton /> },
);

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
