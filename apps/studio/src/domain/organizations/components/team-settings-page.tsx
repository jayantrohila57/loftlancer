"use client";

import { Button } from "@loftlancer/ui/button";
import { Input } from "@loftlancer/ui/input";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Can } from "@/domain/permissions/components/can";
import { useConfirm } from "@/hooks/use-confirm";
import { toast } from "@/lib/toast";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";

export function TeamSettingsPage({
  slug,
  teamId,
}: {
  slug: string;
  teamId: string;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, ConfirmDialog } = useConfirm();
  const teams = useQuery(trpc.teams.list.queryOptions());
  const team = teams.data?.items.find((row) => row.id === teamId);
  const [name, setName] = useState("");
  useEffect(() => {
    if (team) setName(team.name);
  }, [team]);
  const update = useMutation(
    trpc.teams.update.mutationOptions({
      onSuccess: () => {
        toast.success("Team renamed");
        void queryClient.invalidateQueries({
          queryKey: trpc.teams.list.queryKey(),
        });
      },
      onError: (error) => toast.error(error.message),
    }),
  );
  const remove = useMutation(
    trpc.teams.delete.mutationOptions({
      onSuccess: () => {
        toast.success("Team deleted");
        void queryClient.invalidateQueries({
          queryKey: trpc.teams.list.queryKey(),
        });
        router.replace(routes.orgSection(slug, "teams"));
      },
      onError: (error) => toast.error(error.message),
    }),
  );

  return (
    <section className="space-y-4">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Team settings</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Manage this team’s identity and lifecycle.
        </p>
      </div>
      <Can action="team.update">
        <div className="space-y-3 rounded-xl border bg-card p-4">
          <label htmlFor="team-settings-name" className="font-medium text-sm">
            Team name
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <Input
              id="team-settings-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="max-w-sm"
            />
            <Button
              type="button"
              size="sm"
              disabled={
                !team ||
                !name.trim() ||
                name.trim() === team.name ||
                update.isPending
              }
              onClick={() => update.mutate({ teamId, name: name.trim() })}
            >
              Save name
            </Button>
          </div>
        </div>
      </Can>
      <Can action="team.delete">
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-card p-4">
          <h3 className="font-medium text-sm">Delete team</h3>
          <p className="text-muted-foreground text-sm">
            Organization members stay in the organization. Team links are
            removed, while existing project member grants stay in place.
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
                  "Members stay in the organization. Existing project member grants stay in place and can be changed in project Access. This cannot be undone.",
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
        </div>
      </Can>
      {ConfirmDialog}
    </section>
  );
}
