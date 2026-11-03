import type { TicketStatus } from "@loftlancer/drizzle/schema/support";

export type TicketRecord = {
  requesterUserId: string;
  status: TicketStatus | string;
};

export type SupportAccessContext = {
  userId: string;
  isSupportManager: boolean;
};

export function isTicketOwner(
  ctx: SupportAccessContext,
  ticket: TicketRecord,
): boolean {
  return ticket.requesterUserId === ctx.userId;
}

export function canListAllTickets(ctx: SupportAccessContext): boolean {
  return ctx.isSupportManager;
}

export function canReadTicket(
  ctx: SupportAccessContext,
  ticket: TicketRecord,
): boolean {
  return ctx.isSupportManager || isTicketOwner(ctx, ticket);
}

export function canCreateTicket(ctx: SupportAccessContext): boolean {
  return Boolean(ctx.userId);
}

export function canReplyToTicket(
  ctx: SupportAccessContext,
  ticket: TicketRecord,
): boolean {
  if (!canReadTicket(ctx, ticket)) {
    return false;
  }
  if (ctx.isSupportManager) {
    return true;
  }
  return isTicketOwner(ctx, ticket);
}

export function canAddInternalNote(ctx: SupportAccessContext): boolean {
  return ctx.isSupportManager;
}

export function canAssignTicket(ctx: SupportAccessContext): boolean {
  return ctx.isSupportManager;
}

export function canChangeTicketStatus(
  ctx: SupportAccessContext,
  ticket: TicketRecord,
): boolean {
  if (ctx.isSupportManager) {
    return true;
  }
  return isTicketOwner(ctx, ticket);
}

export function canChangeTicketPriority(ctx: SupportAccessContext): boolean {
  return ctx.isSupportManager;
}

export function canReopenTicket(
  ctx: SupportAccessContext,
  ticket: TicketRecord,
): boolean {
  if (!canReadTicket(ctx, ticket)) {
    return false;
  }
  const closed = ticket.status === "closed" || ticket.status === "resolved";
  if (!closed) {
    return false;
  }
  return ctx.isSupportManager || isTicketOwner(ctx, ticket);
}

export function canSoftDeleteTicket(ctx: SupportAccessContext): boolean {
  return ctx.isSupportManager;
}

export function canManageFaq(ctx: SupportAccessContext): boolean {
  return ctx.isSupportManager;
}

export function canViewInternalMessages(ctx: SupportAccessContext): boolean {
  return ctx.isSupportManager;
}

/** Users may only reopen to `open`; managers may set any valid status. */
export function assertUserStatusTransition(
  isManager: boolean,
  from: string,
  to: string,
): boolean {
  if (isManager) {
    return true;
  }
  const wasClosed = from === "closed" || from === "resolved";
  return wasClosed && to === "open";
}
