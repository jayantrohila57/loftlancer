import { rootFontClassName } from "@features/patterns/utils/patterns.fonts.utils";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import { ConsentAnalytics } from "@/components/consent-analytics";
import { siteDescription, siteName, siteUrl } from "@/lib/seo";
import "./globals.css";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION?.trim();
const bingVerification = process.env.BING_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
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
    title: siteName,
    description: siteDescription,
    url: "/",
    images: ["/favicon/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
    images: ["/favicon/og-image.png"],
  },
  robots: { index: true, follow: true },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(bingVerification
      ? { other: { "msvalidate.01": bingVerification } }
      : {}),
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={rootFontClassName}>
      <body className="min-h-screen antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
        >
          {children}
        </ThemeProvider>
        <Analytics />
        <SpeedInsights />
        <ConsentAnalytics />
      </body>
    </html>
  );
}
