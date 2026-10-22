import { rootFontClassName } from "@loftlancer/ui/fonts";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const siteUrl =
  process.env.NEXT_PUBLIC_WWW_URL?.trim() || "https://loftlancer.com";
const description =
  "A clear home for your organizations, projects, teams, apps, environments, and encrypted variables.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Loftlancer", template: "%s | Loftlancer" },
  description,
  applicationName: "Loftlancer",
  openGraph: {
    type: "website",
    siteName: "Loftlancer",
    title: "Loftlancer",
    description,
    url: "/",
  },
  twitter: { card: "summary", title: "Loftlancer", description },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={rootFontClassName}>
      <body className="min-h-screen antialiased">
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
