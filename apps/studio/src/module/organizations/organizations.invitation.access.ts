export type InvitationAccessFailure =
  | "wrong_account"
  | "email_verification_required"
  | "unavailable";

export function classifyInvitationAccessFailure(
  message: string | null | undefined,
): InvitationAccessFailure {
  const normalized = message?.toLowerCase() ?? "";
  if (normalized.includes("recipient of the invitation")) {
    return "wrong_account";
  }
  if (normalized.includes("email verification")) {
    return "email_verification_required";
  }
  return "unavailable";
}

export function getInvitationSignInUrl(
  invitationId: string,
  options: { authUrl: string; studioUrl: string },
): string {
  const invitationUrl = `${options.studioUrl.replace(/\/$/, "")}/invite/${encodeURIComponent(invitationId)}`;
  const signIn = new URL(
    "api/sign-in/github",
    `${options.authUrl.replace(/\/$/, "")}/`,
  );
  signIn.searchParams.set("return_to", invitationUrl);
  return signIn.toString();
}
