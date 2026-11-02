"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { AccordionSection } from "@loftlancer/ui/patterns/accordion-section";
import { AccordionSectionSkeleton } from "@loftlancer/ui/patterns/accordion-section-skeleton";
import { Textarea } from "@loftlancer/ui/textarea";
import { ErrorState } from "@/components/patterns/error-state";
import { RequiredFieldsHint } from "@/components/patterns/required-fields-hint";
import { SettingsRow } from "@/components/patterns/settings-layout";
import { Can } from "@/shared/permissions/shared.permissions.can";
import { useTeamSettingsScreen } from "../hooks/client.use-teams-settings-screen.hook";
import { TeamsResponseMessage } from "./client.response.boundary";

export function TeamSettingsPage({
  slug,
  teamId,
}: {
  slug: string;
  teamId: string;
}) {
  const {
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
  } = useTeamSettingsScreen(slug, teamId);
  if (teams.response && teams.response.status !== "success")
    return (
      <TeamsResponseMessage
        message={teams.response.message}
        error={teams.response.status === "error"}
        retry={() => void teams.refetch()}
      />
    );

  if (teams.isError) {
    return (
      <ErrorState
        title="Could not load team settings"
        description="Try loading the team settings again."
        onRetry={() => void teams.refetch()}
      />
    );
  }
  if (teams.isPending || !team) {
    return (
      <>
        <AccordionSectionSkeleton rows={2} />
        <AccordionSectionSkeleton rows={1} />
      </>
    );
  }

  return (
    <>
      <Can action="team.update">
        <AccordionSection
          title="Team profile"
          description="Give people a clear description of this team and its purpose."
        >
          <div className="space-y-4">
            <RequiredFieldsHint />
            <SettingsRow label="Team name" required>
              <Input
                id="team-settings-name"
                value={name}
                maxLength={100}
                onChange={(event) => setName(event.target.value)}
                className="max-w-xl"
              />
            </SettingsRow>
            <SettingsRow
              label="Description"
              description="Up to 500 characters."
            >
              <Textarea
                id="team-settings-description"
                value={description}
                maxLength={500}
                rows={3}
                onChange={(event) => setDescription(event.target.value)}
                className="max-w-xl"
              />
            </SettingsRow>
            <SettingsRow
              label="Purpose"
              description="What work does this team own?"
            >
              <Input
                id="team-settings-purpose"
                value={purpose}
                maxLength={250}
                onChange={(event) => setPurpose(event.target.value)}
                className="max-w-xl"
              />
            </SettingsRow>
            <Button
              type="button"
              size="sm"
              disabled={
                !name.trim() ||
                update.isPending ||
                (name.trim() === team.name &&
                  description.trim() === (team.description ?? "") &&
                  purpose.trim() === (team.purpose ?? ""))
              }
              onClick={() =>
                update.mutate({
                  teamId,
                  name: name.trim(),
                  description: description.trim() || null,
                  purpose: purpose.trim() || null,
                })
              }
            >
              Save changes
            </Button>
          </div>
        </AccordionSection>
      </Can>
      <Can action="team.delete">
        <AccordionSection
          title="Delete team"
          description="Remove the team and its project access."
          className="border-destructive/30"
        >
          <p className="text-muted-foreground text-sm">
            Organization members remain members. Individual project access
            settings stay saved and apply while at least one team has access.
            Pending team invitations are canceled.
          </p>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            disabled={!team || remove.isPending}
            onClick={() => {
              if (!team) return;
              confirm({
                title: `Delete ${team.name}?`,
                description:
                  "Members stay in the organization. Individual project access settings stay saved and apply while at least one team has access. Pending team invitations are canceled. This cannot be undone.",
                confirmLabel: "Delete team",
                variant: "destructive",
                onConfirm: async () => {
                  await remove.mutateAsync({ teamId });
                },
              });
            }}
          >
            Delete team
          </Button>
        </AccordionSection>
      </Can>
      {ConfirmDialog}
    </>
  );
}
