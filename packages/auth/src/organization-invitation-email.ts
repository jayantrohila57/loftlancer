import { OrgInviteEmail, sendEmail } from "@loftlancer/email";

export async function sendOrganizationInvitationEmail(input: {
  invitationId: string;
  email: string;
  role: string;
  organizationName: string;
  inviterName: string;
}) {
  const studioUrl = (
    process.env.NEXT_PUBLIC_STUDIO_URL ?? "https://loftlancer.com/studio"
  ).replace(/\/$/, "");
  const result = await sendEmail({
    to: input.email,
    subject: `${input.inviterName || "Someone"} invited you to ${input.organizationName} on Loftlancer`,
    react: OrgInviteEmail({
      organizationName: input.organizationName,
      inviterName: input.inviterName || input.email,
      role: input.role,
      acceptUrl: `${studioUrl}/invite/${encodeURIComponent(input.invitationId)}`,
    }),
    tags: [{ name: "type", value: "org-invite" }],
  });
  if (result.status === "skipped") {
    throw new Error(
      "Organization invitation email was not sent: email is not configured",
    );
  }
  if (result.status === "failed") {
    throw new Error("Organization invitation email could not be delivered");
  }
}
