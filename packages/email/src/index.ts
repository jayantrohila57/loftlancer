export {
  type EmailRecorder,
  isEmailConfigured,
  type RecordedEmail,
  type SendEmailInput,
  type SendEmailResult,
  sendEmail,
  setEmailRecorder,
} from "./send";
export {
  MagicLinkEmail,
  type MagicLinkEmailProps,
} from "./templates/magic-link";
export {
  NotificationEmail,
  type NotificationEmailProps,
} from "./templates/notification";
export {
  OrgInviteEmail,
  type OrgInviteEmailProps,
} from "./templates/org-invite";
