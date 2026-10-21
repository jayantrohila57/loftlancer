import { Button, Heading, Text } from "@react-email/components";
import * as React from "react";
import { brand, EmailLayout } from "./layout";

// Keep React available for test runners that use the classic JSX transform.
void React;

export type OrgInviteEmailProps = {
  organizationName: string;
  inviterName: string;
  role: string;
  acceptUrl: string;
};

export function OrgInviteEmail({
  organizationName,
  inviterName,
  role,
  acceptUrl,
}: OrgInviteEmailProps) {
  return (
    <EmailLayout preview={`${inviterName} invited you to ${organizationName}`}>
      <Heading as="h1" style={{ fontSize: 18, margin: "0 0 8px" }}>
        Join {organizationName} on Loftlancer
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "20px", margin: "0 0 16px" }}>
        {inviterName} invited you to join <strong>{organizationName}</strong> as{" "}
        {role}.
      </Text>
      <Button
        href={acceptUrl}
        style={{
          backgroundColor: brand.fg,
          borderRadius: 6,
          color: "#ffffff",
          fontSize: 14,
          padding: "8px 14px",
        }}
      >
        View invitation
      </Button>
      <Text style={{ color: brand.muted, fontSize: 12, margin: "16px 0 0" }}>
        Sign in with GitHub, Google or an email link using this address to
        accept. If you weren't expecting this, you can ignore it.
      </Text>
    </EmailLayout>
  );
}

OrgInviteEmail.PreviewProps = {
  organizationName: "Acme",
  inviterName: "Jayant",
  role: "member",
  acceptUrl: "https://loftlancer.com/studio",
} satisfies OrgInviteEmailProps;

export default OrgInviteEmail;
