import type { Metadata } from "next";
import { Suspense } from "react";
import { siteConfig } from "@/lib/siteConfig";
import { InvitationLandingPage } from "../components/client.invitation-landing.page";

export const invitationLandingMetadata: Metadata = {
  title: `Organization invitation | ${siteConfig.name}`,
  description: "Review and respond to an organization invitation.",
};

export async function OrganizationInvitationPage({
  params,
}: {
  params: Promise<{ invitationId: string }>;
}) {
  const { invitationId } = await params;
  return (
    <Suspense fallback={<InvitationLandingSkeleton />}>
      <InvitationLandingPage invitationId={invitationId} />
    </Suspense>
  );
}

function InvitationLandingSkeleton() {
  return (
    <main className="flex min-h-svh items-center justify-center p-4 sm:p-6">
      <section
        aria-label="Loading invitation"
        className="flex min-h-64 w-full max-w-lg flex-col justify-center gap-4 rounded-md border bg-card p-4 shadow-sm sm:p-6"
      >
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="h-4 w-72 max-w-full animate-pulse rounded bg-muted" />
        <div className="h-10 w-full animate-pulse rounded bg-muted" />
      </section>
    </main>
  );
}
