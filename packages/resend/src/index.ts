/**
 * Resend + React Email integration.
 * Product email workflows live in features/ or module/; this package is send + templates.
 */
export {
  isEmailConfigured,
  resolveEmailFrom,
  resolveResendApiKey,
} from "./config";
export { RESEND_DEFAULT_FROM } from "./constants";
export {
  getResendClient,
  installMailboxRecorder,
  MagicLinkEmail,
  type MagicLinkEmailProps,
  NotificationEmail,
  type NotificationEmailProps,
  OrgInviteEmail,
  type OrgInviteEmailProps,
  recordEmail,
  resetResendClient,
  sendEmail,
  setEmailRecorder,
} from "./core";
export type {
  EmailContext,
  EmailRecorder,
  RecordedEmail,
  SendEmailInput,
  SendEmailResult,
} from "./types";
export { mailboxDelivery, normalizeMailboxEmail } from "./utils";
