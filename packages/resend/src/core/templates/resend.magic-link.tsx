import { Button, Heading, Link, Text } from "@react-email/components";
import { brand, EmailLayout } from "./resend.layout";

export type MagicLinkEmailProps = {
  url: string;
  /** Minutes until the link expires. */
  expiresInMinutes: number;
};

/** Passwordless sign-in link (#373). Thin React Email template for Resend. */
export function MagicLinkEmail({ url, expiresInMinutes }: MagicLinkEmailProps) {
  return (
    <EmailLayout preview="Your Loftlancer sign-in link">
      <Heading as="h1" style={{ fontSize: 18, margin: "0 0 8px" }}>
        Sign in to Loftlancer
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "20px", margin: "0 0 16px" }}>
        Use the button below to sign in. The link works once and expires in{" "}
        {expiresInMinutes} minutes.
      </Text>
      <Button
        href={url}
        style={{
          backgroundColor: brand.fg,
          borderRadius: 6,
          color: "#ffffff",
          fontSize: 14,
          padding: "8px 14px",
        }}
      >
        Sign in
      </Button>
      <Text style={{ color: brand.muted, fontSize: 12, margin: "16px 0 4px" }}>
        Or paste this link into your browser:
      </Text>
      <Link
        href={url}
        style={{ color: brand.muted, fontSize: 12, wordBreak: "break-all" }}
      >
        {url}
      </Link>
      <Text style={{ color: brand.muted, fontSize: 12, margin: "16px 0 0" }}>
        If you didn&apos;t ask to sign in, you can ignore this email. Nobody can
        sign in without this link.
      </Text>
    </EmailLayout>
  );
}

MagicLinkEmail.PreviewProps = {
  url: "https://loftlancer.com/better-auth/api/auth/magic-link/verify?token=example",
  expiresInMinutes: 10,
} satisfies MagicLinkEmailProps;

export default MagicLinkEmail;
