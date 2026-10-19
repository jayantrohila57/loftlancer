import { z } from "zod/v3";

export type NotificationIconName =
  | "invite"
  | "member"
  | "variable"
  | "organization";

export const notificationTypes = [
  "invitation.received",
  "invitation.accepted",
  "support.ticket.reply",
  "task.assigned",
  "task.mentioned",
] as const;

export type NotificationType = (typeof notificationTypes)[number];

const invitationReceivedData = z.object({
  organizationId: z.string(),
  organizationName: z.string(),
  invitationId: z.string(),
  inviterName: z.string(),
});

const invitationAcceptedData = z.object({
  organizationId: z.string(),
  organizationName: z.string(),
  invitationId: z.string(),
  memberName: z.string(),
  memberUserId: z.string(),
});

const supportTicketReplyData = z.object({
  ticketId: z.string(),
  ticketNumber: z.number().int(),
  subject: z.string(),
});

const taskData = z.object({
  /** Missing on rows written before per-org URLs (#299). */
  organizationSlug: z.string().optional(),
  projectSlug: z.string(),
  projectName: z.string(),
  taskId: z.string(),
  taskNumber: z.number().int(),
  title: z.string(),
});

export const notificationDataSchemas: Record<NotificationType, z.ZodTypeAny> = {
  "invitation.received": invitationReceivedData,
  "invitation.accepted": invitationAcceptedData,
  "support.ticket.reply": supportTicketReplyData,
  "task.assigned": taskData,
  "task.mentioned": taskData,
};

export type NotificationRenderContext = {
  actorName?: string | null;
};

export type NotificationRenderResult = {
  title: string;
  body: string;
  icon: NotificationIconName;
  href: string;
};

/** Studio-relative task link; old rows without an org fall back to the inbox. */
function taskHref(data: z.infer<typeof taskData>): string {
  if (!data.organizationSlug) return "/notifications";
  return `/${encodeURIComponent(data.organizationSlug)}/${encodeURIComponent(data.projectSlug)}/tasks/${data.taskNumber}`;
}

export const notificationRenderers: Record<
  NotificationType,
  (data: unknown, ctx: NotificationRenderContext) => NotificationRenderResult
> = {
  "invitation.received": (raw) => {
    const data = invitationReceivedData.parse(raw);
    return {
      title: "Organization invitation",
      body: `${data.inviterName} invited you to join ${data.organizationName}.`,
      icon: "invite",
      href: `/invite/${encodeURIComponent(data.invitationId)}`,
    };
  },
  "invitation.accepted": (raw) => {
    const data = invitationAcceptedData.parse(raw);
    return {
      title: "Invitation accepted",
      body: `${data.memberName} joined ${data.organizationName}.`,
      icon: "member",
      href: "/",
    };
  },
  "support.ticket.reply": (raw) => {
    const data = supportTicketReplyData.parse(raw);
    return {
      title: `Reply on ticket #${data.ticketNumber}`,
      body: data.subject,
      icon: "organization",
      href: `/support/tickets/${encodeURIComponent(data.ticketId)}`,
    };
  },
  "task.assigned": (raw, ctx) => {
    const data = taskData.parse(raw);
    return {
      title: `Assigned: ${data.title}`,
      body: `${ctx.actorName ?? "Someone"} assigned you task #${data.taskNumber} in ${data.projectName}.`,
      icon: "member",
      href: taskHref(data),
    };
  },
  "task.mentioned": (raw, ctx) => {
    const data = taskData.parse(raw);
    return {
      title: `Mentioned on #${data.taskNumber}`,
      body: `${ctx.actorName ?? "Someone"} mentioned you on "${data.title}" in ${data.projectName}.`,
      icon: "member",
      href: taskHref(data),
    };
  },
};
