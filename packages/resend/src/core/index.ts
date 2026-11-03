export { getResendClient, resetResendClient } from "./resend.client";
export {
  installMailboxRecorder,
  recordEmail,
} from "./resend.mailbox-recorder";
export { sendEmail, setEmailRecorder } from "./resend.send";
export {
  MagicLinkEmail,
  type MagicLinkEmailProps,
} from "./templates/resend.magic-link";
export {
  NotificationEmail,
  type NotificationEmailProps,
} from "./templates/resend.notification";
export {
  OrgInviteEmail,
  type OrgInviteEmailProps,
} from "./templates/resend.org-invite";
