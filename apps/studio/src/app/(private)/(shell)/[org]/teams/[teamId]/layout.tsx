import { TeamLayoutShell } from "@/domain/organizations/components/team-layout-shell";
import { guardOrganizationSlugPage } from "@/lib/page-guards";

export default async function TeamLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string; teamId: string }>;
}) {
  const { org, teamId } = await params;
  await guardOrganizationSlugPage(org, "teams");
  return (
    <TeamLayoutShell slug={org} teamId={teamId}>
      {children}
    </TeamLayoutShell>
  );
}
