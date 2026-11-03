import type { NotificationType } from "./notifications.registry.types";

export type NotifyRecipient = {
  userId?: string;
  email?: string;
};

export type NotifyInput = {
  type: NotificationType;
  recipients: NotifyRecipient[];
  actorUserId?: string | null;
  organizationId?: string | null;
  entity?: { type: string; id: string };
  data: unknown;
  idempotencyKey?: string;
  actorName?: string | null;
};
