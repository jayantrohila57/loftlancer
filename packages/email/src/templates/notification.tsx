import { Button, Heading, Text } from "@react-email/components";
import { EmailLayout } from "./layout";

export type NotificationEmailProps = {
  title: string;
  body: string;
  href: string | null;
};

export function NotificationEmail({
  title,
  body,
  href,
}: NotificationEmailProps) {
  return (
    <EmailLayout preview={title}>
      <Heading as="h1" style={{ fontSize: 20, margin: "0 0 12px" }}>
        {title}
      </Heading>
      <Text style={{ fontSize: 14, lineHeight: "22px", margin: "0 0 20px" }}>
        {body}
      </Text>
      {href ? (
        <Button
          href={href}
          style={{
            backgroundColor: "#171717",
            borderRadius: 6,
            color: "#ffffff",
            fontSize: 14,
            padding: "10px 16px",
          }}
        >
          View notification
        </Button>
      ) : null}
    </EmailLayout>
  );
}
