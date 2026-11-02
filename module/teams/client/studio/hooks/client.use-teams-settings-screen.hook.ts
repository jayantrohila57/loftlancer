"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { studioORPC } from "@/lib/orpc";
import { useConfirm } from "@/lib/team-runtime";
import { routes } from "../config/client.routes";
import {
  useTeamsOperationMutation,
  useTeamsOperationQuery,
} from "./client.use-teams-operation.hook";
export function useTeamSettingsScreen(slug: string, teamId: string) {
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const teams = useTeamsOperationQuery("get", { teamId }, () =>
    studioORPC.teams.get({ teamId }),
  );
  const team = teams.data;
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [purpose, setPurpose] = useState("");
  useEffect(() => {
    if (team) {
      setName(team.name);
      setDescription(team.description ?? "");
      setPurpose(team.purpose ?? "");
    }
  }, [team]);
  const update = useTeamsOperationMutation(
    "team.update",
    (input: {
      teamId: string;
      name: string;
      description: string | null;
      purpose: string | null;
    }) => studioORPC.teams.update(input),
  );
  const remove = useTeamsOperationMutation(
    "team.delete",
    (input: { teamId: string }) => studioORPC.teams.delete(input),
    () => router.replace(routes.orgSection(slug, "teams") as never),
  );
  return {
    confirm,
    ConfirmDialog,
    teams,
    team,
    name,
    setName,
    description,
    setDescription,
    purpose,
    setPurpose,
    update,
    remove,
  };
}
