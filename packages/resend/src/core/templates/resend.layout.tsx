import * as React from "react";

void React;

import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

// Keep React available for test runners that use the classic JSX transform.
void React;

export const brand = {
  fg: "#0a0a0a",
  muted: "#71717a",
  border: "#e4e4e7",
  bg: "#fafafa",
};

export function EmailLayout({
  preview,
  children,
}: {
  preview: string;
  children: ReactNode;
}) {
  return (
    <Html lang="en">
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: brand.bg,
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
          margin: 0,
          padding: "24px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: "#ffffff",
            border: `1px solid ${brand.border}`,
            borderRadius: 8,
            maxWidth: 480,
            padding: 24,
          }}
        >
          <Text style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px" }}>
            Loftlancer
          </Text>
          <Section>{children}</Section>
          <Hr style={{ borderColor: brand.border, margin: "24px 0 12px" }} />
          <Text style={{ color: brand.muted, fontSize: 12, margin: 0 }}>
            You received this email because of activity on loftlancer.com.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
