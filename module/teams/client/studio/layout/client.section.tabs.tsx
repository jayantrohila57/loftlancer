"use client";
import { SettingsFrame } from "@loftlancer/ui/patterns/settings-frame";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { TeamDto } from "../../../utils/types/utils.team.dto";
import { teamDisplayName } from "../../../utils/utils.team-display-name";
import { tabs } from "../config/client.routes";
import { useCan } from "../hooks/client.use-teams-permission.hook";
export function TeamsSectionTabs({
  org,
  team,
  organizationName,
  children,
}: {
  org: string;
  team: TeamDto;
  organizationName: string;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const invitations = useCan("member.list");
  return (
    <SettingsFrame
      LinkComponent={Link as never}
      title={teamDisplayName(team.name, organizationName)}
      back={false}
      description={
        pathname === tabs(org, team.id)[0]?.href
          ? team.purpose ||
            team.description ||
            "Team members and project access."
          : undefined
      }
      tabs={tabs(org, team.id)
        .filter((tab) => tab.label !== "Invitations" || invitations.allowed)
        .map((tab) => ({ ...tab, active: pathname === tab.href }))}
    >
      {children}
    </SettingsFrame>
  );
}
