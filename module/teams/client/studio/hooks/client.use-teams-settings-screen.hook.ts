"use client";
import { useConfirm } from "@features/patterns/core/client/patterns.confirm-dialog";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { studioORPC } from "@/lib/orpc";
import { routes } from "../config/client.routes";
import {
  useTeamsOperationMutation,
  useTeamsOperationQuery,
} from "./client.use-teams-operation.hook";
export type TeamSettingsInitial = Awaited<
  ReturnType<typeof studioORPC.teams.get>
>;
export function useTeamSettingsScreen(
  slug: string,
  teamId: string,
  initialData?: TeamSettingsInitial,
) {
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const teams = useTeamsOperationQuery(
    "get",
    { teamId },
    () => studioORPC.teams.get({ teamId }),
    true,
    initialData,
  );
  const team = teams.data;
  const [name, setName] = useState(team?.name ?? "");
  const [description, setDescription] = useState(team?.description ?? "");
  const [purpose, setPurpose] = useState(team?.purpose ?? "");
  const previous = useRef(team);
  useEffect(() => {
    if (!team) return;
    const old = previous.current;
    setName((value) => (!old || value === old.name ? team.name : value));
    setDescription((value) =>
      !old || value === (old.description ?? "")
        ? (team.description ?? "")
        : value,
    );
    setPurpose((value) =>
      !old || value === (old.purpose ?? "") ? (team.purpose ?? "") : value,
    );
    previous.current = team;
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
