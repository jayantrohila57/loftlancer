import { z } from "zod/v3";
import type { NotificationType } from "./registry";

const channelPreferencesSchema = z.object({
  inApp: z.boolean(),
  email: z.boolean(),
});

export const notificationPreferencesSchema = z.object({
  invitations: channelPreferencesSchema,
  membership: channelPreferencesSchema,
  projectActivity: channelPreferencesSchema,
  support: channelPreferencesSchema,
});

export type NotificationPreferences = z.infer<
  typeof notificationPreferencesSchema
>;

export const defaultNotificationPreferences: NotificationPreferences = {
  invitations: { inApp: true, email: true },
  membership: { inApp: true, email: false },
  projectActivity: { inApp: true, email: false },
  support: { inApp: true, email: false },
};

export type NotificationPreferenceGroup = keyof NotificationPreferences;

export function notificationPreferenceGroup(
  type: NotificationType,
): NotificationPreferenceGroup {
  if (type === "invitation.received") return "invitations";
  if (type === "invitation.accepted") return "membership";
  if (type === "support.ticket.reply") return "support";
  return "projectActivity";
}
