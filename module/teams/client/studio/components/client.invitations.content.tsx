"use client";
import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogPanel,
  DialogPopup,
  DialogTitle,
} from "@loftlancer/ui/dialog";
import { Label } from "@loftlancer/ui/label";
import { GuardedDialog } from "@loftlancer/ui/patterns/guarded-dialog";
import { SearchableCombobox } from "@loftlancer/ui/patterns/searchable-combobox";
import { Textarea } from "@loftlancer/ui/textarea";
import type { OrgInviteRole } from "@module/organizations/utils/utils.invite-emails";
import type { useTeamInvitationsScreen } from "../hooks/client.use-teams-invitations-screen.hook";
import { InvitationListControls } from "./client.invitation-controls";
import { OrganizationInvitationsTable } from "./client.invitation-table";
export function TeamInvitationsContent({
  state,
}: {
  state: ReturnType<typeof useTeamInvitationsScreen>;
}) {
  const s = state;
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-semibold text-xl tracking-tight">Invitations</h2>
          <p className="mt-1 text-muted-foreground text-sm">
            People invited here join the organization and this team; team access
            follows the team’s linked projects.
          </p>
        </div>
        {s.canInvite && (
          <Button size="sm" onClick={() => s.setOpen(true)}>
            Invite member
          </Button>
        )}
      </div>
      <InvitationListControls
        status={s.status}
        page={s.page}
        total={s.query.data?.total ?? 0}
        search={s.search}
        onSearchChange={(v) => {
          s.setSearch(v);
          s.setPage(0);
        }}
        onStatusChange={(v) => {
          s.setStatus(v);
          s.setPage(0);
        }}
        onPageChange={s.setPage}
      />
      <OrganizationInvitationsTable
        invitations={s.query.data?.rows ?? []}
        canInvite={s.canResend}
        canRevoke={s.canRevoke}
        caption="Team invitations"
        scopeLabel="Team"
        clientPagination={false}
        revokingId={s.revoke.isPending ? s.revoke.variables.invitationId : null}
        resendingId={
          s.resend.isPending ? s.resend.variables.invitationId : null
        }
        onRevoke={(invitationId) =>
          s.revoke.mutate({ teamId: s.teamId, invitationId })
        }
        onResend={(invite) =>
          s.resend.mutate({ teamId: s.teamId, invitationId: invite.id })
        }
      />
      <GuardedDialog
        open={s.open}
        onOpenChange={(open) => {
          if (!s.sending) s.setOpen(open);
        }}
        isDirty={!s.sending && Boolean(s.raw.trim())}
        onDiscard={s.reset}
        onClosed={s.reset}
        closeWithoutPromptRef={s.closeWithoutPromptRef}
      >
        <DialogPopup>
          <form
            className="contents"
            onSubmit={(e) => {
              e.preventDefault();
              void s.submit();
            }}
          >
            <DialogHeader>
              <DialogTitle>Invite team members</DialogTitle>
              <DialogDescription>
                Invite people to the organization and this team. Linked projects
                determine their team access.
              </DialogDescription>
            </DialogHeader>
            <DialogPanel className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="team-invite-emails">Email addresses</Label>
                <Textarea
                  id="team-invite-emails"
                  value={s.raw}
                  onChange={(e) => s.setRaw(e.target.value)}
                  placeholder="alex@example.com, sam@example.com"
                  disabled={s.sending}
                  required
                  aria-describedby="team-invite-help"
                />
                <p
                  id="team-invite-help"
                  className="text-muted-foreground text-xs"
                >
                  Separate addresses with commas, spaces, or new lines.
                </p>
              </div>
              <SearchableCombobox
                value={s.role}
                onChange={(v) => s.setRole(v as OrgInviteRole)}
                ariaLabel="Organization role"
                options={s.roles.map((value) => ({
                  value,
                  label: value.charAt(0).toUpperCase() + value.slice(1),
                }))}
              />
              <p className="text-muted-foreground text-sm">
                Invitees join the team as members.
              </p>
              {s.context.isPending ? (
                <p role="status">Checking existing members and invitations…</p>
              ) : s.context.isError ||
                s.context.response?.status !== "success" ? (
                <p role="alert">
                  Could not check existing invitations.{" "}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void s.context.refetch()}
                  >
                    Retry
                  </Button>
                </p>
              ) : null}
              {s.parsed.some((p) => p.status === "duplicate") && (
                <p className="text-muted-foreground text-xs">
                  Duplicate addresses are included only once.
                </p>
              )}
              <ul
                className="max-h-44 space-y-1 overflow-y-auto"
                aria-label="Invitation preview"
              >
                {s.parsed
                  .filter((p) => p.status !== "duplicate")
                  .map((p) => (
                    <li
                      key={p.email}
                      className="flex flex-wrap items-center gap-2 text-sm"
                    >
                      <span className="break-all">{p.email}</span>
                      <Badge variant="outline">
                        {p.status === "valid"
                          ? "Ready"
                          : p.status === "member"
                            ? "Already a member"
                            : p.status === "pending"
                              ? "Already invited"
                              : p.status}
                      </Badge>
                      {s.failures[p.email] && (
                        <span role="alert" className="text-destructive">
                          {s.failures[p.email]}
                        </span>
                      )}
                    </li>
                  ))}
              </ul>
            </DialogPanel>
            <DialogFooter>
              <DialogClose
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={s.sending}
                  />
                }
              >
                Cancel
              </DialogClose>
              <Button
                type="submit"
                disabled={
                  s.sending ||
                  !s.valid.length ||
                  !s.roles.includes(s.role) ||
                  s.context.response?.status !== "success"
                }
              >
                {s.sending
                  ? "Sending…"
                  : `Send ${s.valid.length || ""} invitation${s.valid.length === 1 ? "" : "s"}`}
              </Button>
            </DialogFooter>
          </form>
        </DialogPopup>
      </GuardedDialog>
    </section>
  );
}
