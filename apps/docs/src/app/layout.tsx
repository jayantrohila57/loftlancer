import { rootFontClassName } from "@features/patterns/utils/patterns.fonts.utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { RootProvider } from "fumadocs-ui/provider/next";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ConsentAnalytics } from "@/components/consent-analytics";
import { ogImage, siteDescription, siteName, siteUrl } from "@/lib/seo";
import "../index.css";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: { canonical: "/" },
  icons: {
    icon: [
      { url: "/favicon/favicon.ico", sizes: "any" },
      { url: "/favicon/favicon-96x96.png", type: "image/png", sizes: "96x96" },
    ],
    apple: { url: "/favicon/apple-touch-icon.png", sizes: "180x180" },
  },
  manifest: "/favicon/site.webmanifest",
  openGraph: {
    type: "website",
    siteName,
    locale: "en_US",
    url: "/",
    title: siteName,
    description: siteDescription,
    images: [ogImage],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: [ogImage.url],
  },
  robots: { index: true, follow: true },
  // Search Console / Bing Webmaster verification tags, only when set (#350).
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification
      ? { other: { "msvalidate.01": bingVerification } }
      : {}),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className={rootFontClassName}>
      <body className="flex min-h-screen flex-col antialiased">
        <RootProvider search={{ enabled: false }}>{children}</RootProvider>
        <Analytics />
        <SpeedInsights />
        <ConsentAnalytics />
      </body>
    </html>
  );
}
