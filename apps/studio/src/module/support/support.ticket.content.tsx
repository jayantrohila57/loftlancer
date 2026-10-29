"use client";

import { Badge } from "@loftlancer/ui/badge";
import { Button } from "@loftlancer/ui/button";
import { LoadingButton } from "@loftlancer/ui/patterns/loading-button";
import {
  LOCAL_DATE_TIME_FORMAT,
  LocalDateTime,
} from "@loftlancer/ui/patterns/local-date-time";
import { Textarea } from "@loftlancer/ui/textarea";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { routes } from "@/utils/navigation";
import { trpc } from "@/utils/trpc";
import type { SupportTicketDetail } from "./support.ticket.service";

export function SupportTicketContent({
  initialDetail,
}: {
  initialDetail: SupportTicketDetail;
}) {
  const queryClient = useQueryClient();
  const [reply, setReply] = useState("");

  const detail = useQuery({
    ...trpc.support.getTicket.queryOptions({
      ticketId: initialDetail.ticket.id,
    }),
    initialData: initialDetail,
  });

  const replyMutation = useMutation({
    ...trpc.support.replyToTicket.mutationOptions(),
    onSuccess: async () => {
      setReply("");
      await queryClient.invalidateQueries();
    },
  });

  const statusMutation = useMutation({
    ...trpc.support.updateTicketStatus.mutationOptions(),
    onSuccess: async () => {
      await queryClient.invalidateQueries();
    },
  });

  const ticket = detail.data?.ticket;

  if (detail.isLoading) {
    return <p className="text-muted-foreground text-sm">Loading ticket…</p>;
  }
  if (!ticket) {
    return <p className="text-destructive text-sm">Ticket not found.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{ticket.status.replace("_", " ")}</Badge>
        <Badge variant="secondary">{ticket.priority}</Badge>
        <Badge variant="outline">{ticket.category}</Badge>
        {ticket.status === "closed" || ticket.status === "resolved" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              statusMutation.mutate({ ticketId: ticket.id, status: "open" })
            }
          >
            Reopen
          </Button>
        ) : null}
      </div>
      <p className="whitespace-pre-wrap text-sm">{ticket.description}</p>
      <section className="space-y-3">
        <h2 className="font-medium text-sm">Conversation</h2>
        <ul className="space-y-3">
          {detail.data?.messages.map((message) => (
            <li key={message.id} className="rounded-md border p-3 text-sm">
              <div className="mb-1 flex flex-wrap items-center gap-2 text-muted-foreground text-xs">
                <span>{message.authorName ?? message.authorEmail}</span>
                <LocalDateTime
                  value={message.createdAt}
                  options={LOCAL_DATE_TIME_FORMAT}
                />
              </div>
              <p className="whitespace-pre-wrap">{message.body}</p>
            </li>
          ))}
        </ul>
      </section>
      <form
        className="space-y-2"
        onSubmit={(e) => {
          e.preventDefault();
          replyMutation.mutate({
            ticketId: ticket.id,
            body: reply,
            isInternal: false,
          });
        }}
      >
        <Textarea
          rows={4}
          value={reply}
          onChange={(e) => setReply(e.target.value)}
          placeholder="Write a reply…"
          required
        />
        <LoadingButton
          type="submit"
          loading={replyMutation.isPending}
          loadingLabel="Sending…"
          disabled={!reply.trim()}
        >
          Send reply
        </LoadingButton>
      </form>
      <p className="text-muted-foreground text-xs">
        Need more help? Browse the{" "}
        <Link href={routes.supportHelp()} className="underline">
          help center
        </Link>
        .
      </p>
    </div>
  );
}
