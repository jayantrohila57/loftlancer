"use client";

import { Button } from "@loftlancer/ui/button";
import { DataTable } from "@loftlancer/ui/data-table/data-table";
import {
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@loftlancer/ui/dialog";
import { Input } from "@loftlancer/ui/input";
import { EmptyState } from "@loftlancer/ui/patterns/empty-state";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppIcon } from "@/components/patterns/app-icon";
import { ErrorState } from "@/components/patterns/error-state";
import { FormField } from "@/components/patterns/form-field";
import { GuardedDialog } from "@/components/patterns/guarded-dialog";
import { Can } from "@/domain/permissions/components/can";
import { isTeamCreateFormDirty } from "@/lib/form-dirty";
import { appIcons } from "@/lib/icons";
import { toast } from "@/lib/toast";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import { useOrganizationBySlug } from "../hooks/use-organization-by-slug";
import { OrganizationSectionPage } from "./organization-section-page";

export function OrganizationTeamsPage({ slug }: { slug: string }) {
  const {
    organization,
    status: orgStatus,
    error: organizationError,
    reload: reloadOrganization,
  } = useOrganizationBySlug(slug);
  const router = useRouter();
  const queryClient = useQueryClient();
  const closeWithoutPromptRef = useRef<(() => void) | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [teamDescription, setTeamDescription] = useState("");
  const [teamPurpose, setTeamPurpose] = useState("");
  const teamsQuery = useQuery({
    ...trpc.teams.list.queryOptions(),
    enabled: Boolean(organization?.id),
  });
  const create = useMutation(
    trpc.teams.create.mutationOptions({
      onSuccess: (team) => {
        toast.success("Team created");
        setTeamName("");
        setTeamDescription("");
        setTeamPurpose("");
        closeWithoutPromptRef.current?.();
        setCreateOpen(false);
        void queryClient.invalidateQueries({
          queryKey: trpc.teams.list.queryKey(),
        });
        router.push(routes.team(slug, team.id));
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const teams = teamsQuery.data?.items ?? [];

  return (
    <OrganizationSectionPage
      slug={slug}
      title="Teams"
      description="Group organization members and connect teams to projects."
      action={
        organization ? (
          <Can action="team.create" fallback={null}>
            <Button
              type="button"
              size="sm"
              className="gap-2"
              onClick={() => setCreateOpen(true)}
            >
              <AppIcon name="plus" className="text-current" />
              New team
            </Button>
          </Can>
        ) : undefined
      }
    >
      {orgStatus === "error" ? (
        <ErrorState
          title="Could not load organization"
          description={
            organizationError?.message ?? "Try loading the organization again."
          }
          onRetry={() => void reloadOrganization()}
        />
      ) : teamsQuery.isError ? (
        <ErrorState
          title="Could not load teams"
          description="Try loading the teams again."
          onRetry={() => void teamsQuery.refetch()}
        />
      ) : orgStatus === "loading" ||
        !organization ||
        teamsQuery.isLoading ||
        teams.length > 0 ? (
        <DataTable
          framed
          searchable
          enablePagination
          pageSize={20}
          searchPlaceholder="Search teams…"
          isLoading={
            orgStatus === "loading" || !organization || teamsQuery.isLoading
          }
          skeletonRowCount={3}
          data={teams}
          columns={[
            {
              accessorKey: "name",
              header: "Team",
              cell: ({ row }) => (
                <div className="min-w-0">
                  <Link
                    href={routes.team(slug, row.original.id)}
                    className="font-medium hover:underline"
                  >
                    {row.original.name}
                  </Link>
                  <span className="mt-1 block max-w-md truncate text-muted-foreground text-xs">
                    {row.original.purpose ||
                      row.original.description ||
                      "No team description"}
                  </span>
                </div>
              ),
            },
            {
              id: "projects",
              header: "Project access",
              cell: ({ row }) => (
                <Link
                  href={routes.teamSection(slug, row.original.id, "projects")}
                  className="text-primary text-sm hover:underline"
                >
                  Review linked projects
                </Link>
              ),
            },
          ]}
        />
      ) : (
        <EmptyState
          icon={appIcons.member}
          title="No teams yet"
          description="Create a team to organize members and project access."
        />
      )}
      <GuardedDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        isDirty={isTeamCreateFormDirty(teamName, teamDescription, teamPurpose)}
        onDiscard={() => {
          setTeamName("");
          setTeamDescription("");
          setTeamPurpose("");
        }}
        closeWithoutPromptRef={closeWithoutPromptRef}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create team</DialogTitle>
          </DialogHeader>
          <FormField id="team-name" label="Team name" required>
            <Input
              id="team-name"
              value={teamName}
              onChange={(event) => setTeamName(event.target.value)}
              placeholder="Platform"
            />
          </FormField>
          <FormField id="team-purpose" label="Purpose">
            <Input
              id="team-purpose"
              value={teamPurpose}
              maxLength={250}
              onChange={(event) => setTeamPurpose(event.target.value)}
              placeholder="What work does this team own?"
            />
          </FormField>
          <FormField id="team-description" label="Description">
            <Textarea
              id="team-description"
              value={teamDescription}
              maxLength={500}
              rows={3}
              onChange={(event) => setTeamDescription(event.target.value)}
              placeholder="A short description of this team"
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={create.isPending || !teamName.trim()}
              onClick={() =>
                create.mutate({
                  name: teamName.trim(),
                  purpose: teamPurpose.trim() || undefined,
                  description: teamDescription.trim() || undefined,
                })
              }
            >
              Create team
            </Button>
          </DialogFooter>
        </DialogContent>
      </GuardedDialog>
    </OrganizationSectionPage>
  );
}
