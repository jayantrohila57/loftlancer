import dynamic from "next/dynamic";

const TeamsListCreateTeamIsland = dynamic(
  () =>
    import("../components/client.list.create-team.island").then(
      (m) => m.TeamsListCreateTeamIsland,
    ),
  {
    loading: () => (
      <span
        className="inline-block h-8 w-24 animate-pulse rounded-md bg-muted"
        aria-hidden
      />
    ),
  },
);

/** Static list screen title — create action is a dynamic client leaf. */
export function TeamsListHeaderSection({
  orgId,
  slug,
}: {
  orgId: string;
  slug: string;
}) {
  return (
    <header className="flex flex-wrap items-start justify-between gap-3">
      <div>
        <h2 className="font-semibold text-xl tracking-tight">Teams</h2>
        <p className="mt-1 text-muted-foreground text-sm">
          Group organization members and connect teams to projects.
        </p>
      </div>
      <TeamsListCreateTeamIsland orgId={orgId} slug={slug} />
    </header>
  );
}
