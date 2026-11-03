export type SentryTestResult =
  | { status: "sent"; eventId?: string }
  | { status: "rejected" };
