"use client";

import { Button } from "@loftlancer/ui/button";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useConfirm } from "@/hooks/use-confirm";
import { authClient } from "@/lib/auth-client";
import { toast } from "@/lib/toast";
import { routes } from "@/utils/navigation";
import { useInvitationLanding } from "../hooks/use-invitation-landing";

export function InvitationLandingPage({
  invitationId,
}: {
  invitationId: string;
}) {
  const router = useRouter();
  const { confirm, ConfirmDialog } = useConfirm();
  const invite = useInvitationLanding(invitationId);
  const preview = invite.preview;

  const respond = async (kind: "accept" | "decline") => {
    try {
      if (kind === "accept") {
        await invite.acceptInvitation();
        toast.success("Invitation accepted");
        if (preview?.organizationSlug) {
          router.replace(routes.org(preview.organizationSlug));
        }
      } else {
        await invite.declineInvitation();
        toast.success("Invitation declined");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not respond to invitation",
      );
    }
  };

  if (invite.sessionPending || invite.previewPending) {
    return (
      <InvitationLayout>
        <InvitationState title="Loading invitation" />
      </InvitationLayout>
    );
  }
  if (invite.previewError || !preview) {
    return (
      <InvitationLayout>
        <InvitationState
          title="Could not load invitation"
          description="Check your connection and try again."
          action={
            <Button onClick={() => void invite.refetchPreview()}>
              Try again
            </Button>
          }
        />
      </InvitationLayout>
    );
  }

  const metadata =
    preview.status !== "not_found" ? (
      <div className="space-y-1 text-muted-foreground text-sm">
        <p>
          Workspace:{" "}
          <span className="font-medium text-foreground">
            {preview.organizationName}
          </span>
        </p>
        <p>
          Role:{" "}
          <span className="font-medium text-foreground capitalize">
            {preview.role}
          </span>
        </p>
        {preview.inviterName ? <p>Invited by {preview.inviterName}</p> : null}
      </div>
    ) : null;

  let content: ReactNode;
  if (preview.status === "not_found") {
    content = (
      <InvitationState
        title="Invitation not found"
        description="This link may be incorrect or no longer available."
      />
    );
  } else if (preview.status === "expired") {
    content = (
      <InvitationState
        title="Invitation expired"
        description="Ask an organization manager to send you a new invitation."
        details={metadata}
      />
    );
  } else if (preview.status === "revoked" || preview.status === "unavailable") {
    content = (
      <InvitationState
        title="Invitation unavailable"
        description="This invitation can no longer be used."
        details={metadata}
      />
    );
  } else if (preview.status === "accepted") {
    content = (
      <InvitationState
        title="Invitation already accepted"
        description="You can open the workspace if it is available to your account."
        details={metadata}
        action={
          preview.organizationSlug ? (
            <Button
              render={<Link href={routes.org(preview.organizationSlug)} />}
            >
              Open workspace
            </Button>
          ) : undefined
        }
      />
    );
  } else if (preview.status === "declined" || invite.declined) {
    content = (
      <InvitationState
        title="Invitation declined"
        description="The invitation has been declined."
        details={metadata}
      />
    );
  } else if (!invite.session) {
    content = (
      <InvitationState
        title="You’re invited"
        description="Sign in or create an account with the invited email address to continue."
        details={metadata}
        action={
          <Button render={<a href={invite.signInUrl} />}>
            Continue with GitHub
          </Button>
        }
      />
    );
  } else if (invite.detailsPending) {
    content = (
      <InvitationState
        title="Checking invitation"
        description="Verifying that this invitation belongs to your account…"
        details={metadata}
      />
    );
  } else if (invite.accessFailure === "wrong_account") {
    content = (
      <InvitationState
        title="Use the invited account"
        description={`You’re signed in as ${invite.session.user.email}. Switch to the account that received this invitation, then reopen this link.`}
        details={metadata}
        action={
          <Button
            variant="outline"
            onClick={async () => {
              const result = await authClient.signOut();
              if (result.error) {
                toast.error(
                  "Could not sign out. Please sign out and reopen this invitation.",
                );
                return;
              }
              window.location.assign(invite.signInUrl);
            }}
          >
            Switch account
          </Button>
        }
      />
    );
  } else if (invite.accessFailure === "email_verification_required") {
    content = (
      <InvitationState
        title="Verify your email first"
        description="Verify the invited email address in your account, then reopen this invitation."
        details={metadata}
      />
    );
  } else if (invite.detailsError || !invite.details) {
    content = (
      <InvitationState
        title="Could not verify invitation"
        description="The invitation may have changed. Ask the organization manager to check its status."
        details={metadata}
      />
    );
  } else {
    content = (
      <InvitationState
        title="Accept your invitation"
        description={`You’re signed in as ${invite.session.user.email}. Accept to join ${preview.organizationName} as a ${preview.role}.`}
        details={metadata}
        action={
          <div className="flex flex-wrap gap-2">
            <Button
              disabled={invite.accepting || invite.declining}
              onClick={() => void respond("accept")}
            >
              {invite.accepting ? "Accepting…" : "Accept invitation"}
            </Button>
            <Button
              variant="outline"
              disabled={invite.accepting || invite.declining}
              onClick={() =>
                confirm({
                  title: "Decline invitation?",
                  description: `You will not join ${preview.organizationName}.`,
                  confirmLabel: "Decline invitation",
                  variant: "destructive",
                  onConfirm: () => respond("decline"),
                })
              }
            >
              {invite.declining ? "Declining…" : "Decline"}
            </Button>
          </div>
        }
      />
    );
  }

  return (
    <InvitationLayout>
      {content}
      {ConfirmDialog}
    </InvitationLayout>
  );
}

function InvitationLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-background p-6">
      <section className="flex min-h-64 w-full max-w-lg flex-col justify-center gap-5 rounded-xl border bg-card p-6 shadow-sm">
        <Link
          className="text-muted-foreground text-sm hover:text-foreground"
          href={routes.home()}
        >
          ← Back to Loftlancer
        </Link>
        {children}
      </section>
    </main>
  );
}

function InvitationState({
  title,
  description,
  details,
  action,
}: {
  title: string;
  description?: string;
  details?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h1 className="font-semibold text-xl">{title}</h1>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {details}
      {action}
    </div>
  );
}
