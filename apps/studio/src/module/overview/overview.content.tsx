"use client";

export function StudioOverviewContent() {
  return (
    <div className="space-y-2 p-6">
      <h1 className="font-semibold text-2xl">Overview</h1>
      <p className="text-muted-foreground text-sm">
        Organizations, teams, projects, and marketplace apps were removed in the
        product reset. Account and auth remain available from the sidebar.
      </p>
    </div>
  );
}

export { StudioOverviewContent as OverviewContent };
